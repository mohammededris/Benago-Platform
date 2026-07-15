const { clerkClient, getAuth } = require("@clerk/express");
const { withTimeout } = require("../lib/withTimeout");
const connectDB = require("../lib/connectDB");
const Registration = require("../Schema/registrationSchema");

const CLERK_API_TIMEOUT_MS = 8000;

async function syncStudent(req, res) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { sessionClaims } = getAuth(req);
    const existingMetadata = sessionClaims?.publicMetadata || sessionClaims?.public_metadata;
    if (existingMetadata?.role) {
      return res.json({
        role: existingMetadata.role,
        courseId: existingMetadata.courseId ?? null,
      });
    }

    await connectDB();

    const clerkUser = await withTimeout(
      clerkClient.users.getUser(userId),
      CLERK_API_TIMEOUT_MS,
      "clerkClient.users.getUser (syncStudent)",
    );
    const existingRole = clerkUser.publicMetadata?.role;

    if (existingRole) {
      return res.json({
        role: existingRole,
        courseId: clerkUser.publicMetadata?.courseId ?? null,
      });
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "No email found for this user" });
    }

    const registration = await Registration.findOne({ email }).collation({
      locale: "en",
      strength: 2,
    });

    if (!registration) {
      return res.status(404).json({ error: "No matching account found" });
    }

    await withTimeout(
      clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: "student",
          courseId: String(registration.courseId),
        },
      }),
      CLERK_API_TIMEOUT_MS,
      "clerkClient.users.updateUserMetadata (syncStudent)",
    );

    const [localPart, domainPart] = email.split("@");
    const maskedEmail = localPart ? `${localPart[0]}***@${domainPart || ""}` : "***";
    console.log(
      `Lazy sync: ${maskedEmail} → student (course: ${registration.courseId})`,
    );

    res.json({ role: "student", courseId: String(registration.courseId) });
  } catch (err) {
    console.error("syncStudent error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { syncStudent };
