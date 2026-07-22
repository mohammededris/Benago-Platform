const { Webhook } = require("svix");
const { clerkClient } = require("@clerk/express");
const { withTimeout } = require("../../lib/withTimeout");
const Registration = require("../../Schema/registrationSchema");
const Instructor = require("../../Schema/instructorSchema");
const WebhookEvent = require("../../Schema/webhookEventSchema");

const CLERK_API_TIMEOUT_MS = 8000;
const EVENT_LEASE_MS = 30 * 1000;

function metadataMatches(currentMetadata, nextMetadata) {
  const current = currentMetadata || {};
  if (current.role !== nextMetadata.role) return false;

  if (nextMetadata.role === "student") {
    return String(current.courseId ?? "") === String(nextMetadata.courseId ?? "");
  }

  const currentCourseIds = Array.isArray(current.courseIds)
    ? current.courseIds.map(String).sort()
    : [];
  const nextCourseIds = Array.isArray(nextMetadata.courseIds)
    ? nextMetadata.courseIds.map(String).sort()
    : [];

  return JSON.stringify(currentCourseIds) === JSON.stringify(nextCourseIds);
}

async function updateMetadataIfNeeded(clerkUser, publicMetadata) {
  const currentMetadata = clerkUser.public_metadata || clerkUser.publicMetadata;
  if (metadataMatches(currentMetadata, publicMetadata)) return false;

  await withTimeout(
    clerkClient.users.updateUserMetadata(clerkUser.id, { publicMetadata }),
    CLERK_API_TIMEOUT_MS,
    "clerkClient.users.updateUserMetadata (webhook)",
  );
  return true;
}

async function claimEvent(eventId, type) {
  const now = new Date();
  const leaseUntil = new Date(now.getTime() + EVENT_LEASE_MS);

  try {
    await WebhookEvent.create({
      eventId,
      type,
      status: "processing",
      leaseUntil,
    });
    return { claimed: true };
  } catch (error) {
    if (error.code !== 11000) throw error;
  }

  const reclaimed = await WebhookEvent.findOneAndUpdate(
    {
      eventId,
      $or: [
        { status: "failed" },
        { status: "processing", leaseUntil: { $lt: now } },
      ],
    },
    {
      $set: { status: "processing", type, leaseUntil, lastError: null },
      $unset: { processedAt: 1 },
      $inc: { attempts: 1 },
    },
    { new: true },
  ).lean();

  if (reclaimed) return { claimed: true };

  const existing = await WebhookEvent.findOne({ eventId }).select({ status: 1 }).lean();
  return {
    claimed: false,
    completed: existing?.status === "completed",
    processing: existing?.status === "processing",
  };
}

async function markCompleted(eventId) {
  await WebhookEvent.updateOne(
    { eventId },
    {
      $set: { status: "completed", processedAt: new Date() },
      $unset: { leaseUntil: 1, lastError: 1 },
    },
  );
}

async function markFailed(eventId, error) {
  await WebhookEvent.updateOne(
    { eventId },
    {
      $set: {
        status: "failed",
        lastError: String(error.message || error).slice(0, 2000),
      },
      $unset: { leaseUntil: 1 },
    },
  );
}

async function processUserEvent(evt) {
  if (evt.type !== "user.created" && evt.type !== "user.updated") return;

  const clerkUser = evt.data || {};
  const email = clerkUser.email_addresses?.[0]?.email_address?.toLowerCase();
  if (!clerkUser.id || !email) return;

  const [localPart, domainPart] = email.split("@");
  const maskedEmail = localPart
    ? `${localPart[0]}***@${domainPart || ""}`
    : "***";

  const registration = await Registration.findOne({ email }).collation({
    locale: "en",
    strength: 2,
  });

  if (registration) {
    const publicMetadata = {
      role: "student",
      courseId: String(registration.courseId),
    };
    const updated = await updateMetadataIfNeeded(clerkUser, publicMetadata);
    console.log(
      `Webhook ${updated ? "synced" : "already synchronized"}: ${maskedEmail} → student (course: ${registration.courseId})`,
    );
    return;
  }

  const instructor = await Instructor.findOne({ email }).collation({
    locale: "en",
    strength: 2,
  });

  if (!instructor) return;

  const publicMetadata = {
    role: "instructor",
    courseIds: Array.isArray(instructor.courseIds)
      ? instructor.courseIds
      : [],
  };
  const updated = await updateMetadataIfNeeded(clerkUser, publicMetadata);

  if (!instructor.clerkId) {
    instructor.clerkId = clerkUser.id;
    await instructor.save();
  }

  console.log(
    `Webhook ${updated ? "synced" : "already synchronized"}: ${maskedEmail} → instructor (courses: ${publicMetadata.courseIds.join(", ")})`,
  );
}

async function clerkWebhookHandler(req, res) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  let evt;
  try {
    evt = new Webhook(secret).verify(req.body, req.headers);
  } catch (error) {
    console.error("Clerk webhook signature verification failed:", error.message);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const eventId = evt.id || req.headers["svix-id"];
  if (!eventId) {
    return res.status(400).json({ error: "Webhook event ID is missing" });
  }

  try {
    const claim = await claimEvent(eventId, evt.type || "unknown");

    if (!claim.claimed) {
      if (claim.completed) {
        return res.status(200).json({ received: true, duplicate: true });
      }
      return res.status(409).json({ error: "Webhook event is already processing" });
    }

    await processUserEvent(evt);
    await markCompleted(eventId);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    try {
      await markFailed(eventId, error);
    } catch (markError) {
      console.error("Unable to mark webhook event as failed:", markError);
    }
    return res.status(500).json({ error: "Webhook processing failed" });
  }
}

module.exports = clerkWebhookHandler;
