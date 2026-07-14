const { clerkClient, getAuth } = require("@clerk/express");
const Registration = require("../Schema/registrationSchema");

/**
 * POST /api/students/sync
 *
 * Lazy fallback sync — called by the client Landing page when publicMetadata
 * has no role yet (e.g. the webhook fired before the user was in the DB,
 * or the webhook failed entirely).
 *
 * Auth is verified via getAuth(req) — the @clerk/express v2 way.
 * clerkMiddleware() must run before this handler (applied globally in index.js).
 */
async function syncStudent(req, res) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Fetch the full Clerk user to get their email
    const clerkUser = await clerkClient.users.getUser(userId);

    // Guard: if a role is already assigned, do not overwrite it
    const existingRole = clerkUser.publicMetadata?.role;
    if (existingRole) {
      return res.json({
        role: existingRole,
        courseId: clerkUser.publicMetadata?.courseId ?? null,
      });
    }

    const email =
      clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "No email found for this user" });
    }

    // Look up Registration (case-insensitive via collation)
    const registration = await Registration.findOne({ email }).collation({
      locale: "en",
      strength: 2,
    });

    if (!registration) {
      // Generic message — don't reveal whether the email exists
      return res
        .status(404)
        .json({ error: "No matching account found" });
    }

    // Write role + courseId into Clerk publicMetadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "student",
        courseId: String(registration.courseId),
      },
    });

    console.log(`Lazy sync: ${email} → student (course: ${registration.courseId})`);

    res.json({ role: "student", courseId: String(registration.courseId) });
  } catch (err) {
    console.error("syncStudent error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { syncStudent };
