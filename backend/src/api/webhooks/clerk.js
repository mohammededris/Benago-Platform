const { Webhook } = require("svix");
const { clerkClient } = require("@clerk/express");
const connectDB = require("../../lib/connectDB");
const Registration = require("../../Schema/registrationSchema");
const Instructor = require("../../Schema/instructorSchema");

async function clerkWebhookHandler(req, res) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    console.error("CLERK_WEBHOOK_SECRET is not set");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  const wh = new Webhook(secret);
  let evt;

  try {
    evt = wh.verify(req.body, req.headers);
  } catch (error) {
    console.error(
      "Clerk webhook signature verification failed:",
      error.message,
    );
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  // Connect to DB only after the webhook signature is verified
  await connectDB();

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const clerkUser = evt.data;
    const email = clerkUser.email_addresses?.[0]?.email_address?.toLowerCase();

    if (email) {
      const [localPart, domainPart] = email.split("@");
      const maskedEmail = localPart ? `${localPart[0]}***@${domainPart || ""}` : "***";
      try {
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
            `Webhook synced: ${maskedEmail} → student (course: ${registration.courseId})`,
          );
          return res.status(200).json({ received: true });
        }

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

          if (!instructor.clerkId) {
            instructor.clerkId = clerkUser.id;
            await instructor.save();
          }

          console.log(
            `Webhook synced: ${maskedEmail} → instructor (courses: ${instructor.courseIds.join(", ")})`,
          );
        }
      } catch (error) {
        console.error("Webhook DB/Clerk update error:", error);
        return res.status(500).json({ error: "Webhook processing failed" });
      }
    }
  }

  res.status(200).json({ received: true });
}

module.exports = clerkWebhookHandler;
