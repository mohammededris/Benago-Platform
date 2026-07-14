const { Webhook } = require("svix");
const { clerkClient } = require("@clerk/express");
const Registration = require("../../Schema/registrationSchema");
const Instructor = require("../../Schema/instructorSchema");

/**
 * POST /api/webhooks/clerk
 *
 * Handles Clerk `user.created` and `user.updated` events.
 *
 * Priority order for metadata sync:
 *   1. Registration collection → role: "student"
 *   2. Instructor collection   → role: "instructor"
 *
 * Also persists `clerkId` back onto the Instructor document so that
 * future courseIds changes can push directly to Clerk without an email lookup.
 *
 * IMPORTANT: This route must receive the RAW request body (not JSON-parsed).
 * Register it in index.js with express.raw({ type: "application/json" })
 * BEFORE the global express.json() middleware.
 */
async function clerkWebhookHandler(req, res) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  const wh = new Webhook(secret);
  let evt;

  try {
    // req.body must be the raw Buffer here — ensured by express.raw()
    evt = wh.verify(req.body, req.headers);
  } catch (err) {
    console.error("Clerk webhook signature verification failed:", err.message);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const clerkUser = evt.data;
    const email =
      clerkUser.email_addresses?.[0]?.email_address?.toLowerCase();

    if (email) {
      try {
        // ── 1. Check Registration (student) ───────────────────────────────
        const registration = await Registration.findOne({ email }).collation({
          locale: "en",
          strength: 2,
        });

        if (registration) {
          await clerkClient.users.updateUserMetadata(clerkUser.id, {
            publicMetadata: {
              role: "student",
              courseId: String(registration.courseId),
            },
          });
          console.log(
            `Webhook synced: ${email} → student (course: ${registration.courseId})`
          );
          return res.status(200).json({ received: true });
        }

        // ── 2. Check Instructor ────────────────────────────────────────────
        const instructor = await Instructor.findOne({ email }).collation({
          locale: "en",
          strength: 2,
        });

        if (instructor) {
          await clerkClient.users.updateUserMetadata(clerkUser.id, {
            publicMetadata: {
              role: "instructor",
              courseIds: instructor.courseIds,
            },
          });

          // Persist the Clerk userId so future courseIds updates can push
          // directly without doing another email lookup.
          if (!instructor.clerkId) {
            instructor.clerkId = clerkUser.id;
            await instructor.save();
          }

          console.log(
            `Webhook synced: ${email} → instructor (courses: ${instructor.courseIds.join(", ")})`
          );
        }
        // No match in either collection — leave metadata untouched.
        // The client's lazy sync fallback will handle it on next sign-in.
      } catch (err) {
        console.error("Webhook DB/Clerk update error:", err);
        return res.status(500).json({ error: "Webhook processing failed" });
      }
    }
  }

  res.status(200).json({ received: true });
}

module.exports = clerkWebhookHandler;
