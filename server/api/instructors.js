const { clerkClient, getAuth } = require("@clerk/express");
const Joi = require("joi");
const Instructor = require("../Schema/instructorSchema");

// ── Joi schema for instructor update validation ──────────────────────────────
const updateInstructorSchema = Joi.object({
  courseIds: Joi.array().items(
    Joi.string().pattern(/^[a-zA-Z0-9_-]{1,64}$/).required()
  ).max(50),
  name: Joi.string().trim().min(1).max(200),
  email: Joi.string().trim().email().max(320),
}).min(1);  // require at least one field

/**
 * POST /api/instructors/sync
 *
 * Lazy fallback sync — called by the client Landing page when publicMetadata
 * has no role yet and the /api/students/sync endpoint returned 404.
 *
 * 1. Looks up the signed-in user's email in the Instructor collection.
 * 2. Writes `role: "instructor"` and `courseIds` into Clerk publicMetadata.
 * 3. Persists the Clerk userId (`clerkId`) back onto the Instructor document
 *    so future courseIds changes can push to Clerk without an email lookup.
 */
async function syncInstructor(req, res) {
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
        courseIds: clerkUser.publicMetadata?.courseIds ?? [],
      });
    }

    const email =
      clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "No email found for this user" });
    }

    // Look up Instructor (case-insensitive via collation)
    const instructor = await Instructor.findOne({ email }).collation({
      locale: "en",
      strength: 2,
    });

    if (!instructor) {
      // Generic message — don't reveal whether the email exists
      return res
        .status(404)
        .json({ error: "No matching account found" });
    }

    // Write role + courseIds into Clerk publicMetadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "instructor",
        courseIds: instructor.courseIds,
      },
    });

    // Save clerkId on the Instructor document for future direct pushes
    if (!instructor.clerkId) {
      instructor.clerkId = userId;
      await instructor.save();
    }

    console.log(
      `Lazy sync: ${email} → instructor (courses: ${instructor.courseIds.join(", ")})`
    );

    res.json({ role: "instructor", courseIds: instructor.courseIds });
  } catch (err) {
    console.error("syncInstructor error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PUT /api/instructors/:id
 *
 * Admin-only — updates an instructor's courseIds in MongoDB and immediately
 * pushes the new array to that instructor's Clerk publicMetadata.
 *
 * :id is the MongoDB _id of the Instructor document.
 */
async function updateInstructor(req, res) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate MongoDB ObjectId format for :id param
    if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
      return res.status(400).json({ error: "Invalid instructor ID format" });
    }

    // Validate request body with Joi before touching the DB
    const { error: validationError, value: validBody } = updateInstructorSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (validationError) {
      const messages = validationError.details.map((d) => d.message);
      return res.status(400).json({ error: messages.join("; ") });
    }

    // Verify the caller is an admin
    const callerClerkUser = await clerkClient.users.getUser(userId);
    const callerRole = callerClerkUser.publicMetadata?.role;

    if (callerRole !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden: only admins can update instructor records" });
    }

    const instructor = await Instructor.findById(req.params.id);

    if (!instructor) {
      return res.status(404).json({ error: "Instructor not found" });
    }

    const { courseIds, name, email } = validBody;

    if (courseIds !== undefined) instructor.courseIds = courseIds;
    if (name !== undefined) instructor.name = name;
    if (email !== undefined) instructor.email = email;

    await instructor.save();

    // Push updated courseIds to Clerk if we have the instructor's clerkId
    if (instructor.clerkId) {
      await clerkClient.users.updateUserMetadata(instructor.clerkId, {
        publicMetadata: {
          role: "instructor",
          courseIds: instructor.courseIds,
        },
      });
      console.log(
        `Admin updated instructor ${instructor.email} courses → [${instructor.courseIds.join(", ")}] and synced to Clerk`
      );
    } else {
      // clerkId not yet stored — the next sign-in will sync via webhook / lazy-sync
      console.log(
        `Admin updated instructor ${instructor.email} courses → [${instructor.courseIds.join(", ")}] (Clerk sync pending next login)`
      );
    }

    res.json(instructor);
  } catch (err) {
    console.error("updateInstructor error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { syncInstructor, updateInstructor };
