const { clerkClient, getAuth } = require("@clerk/express");
const Joi = require("joi");
const connectDB = require("../lib/connectDB");
const Instructor = require("../Schema/instructorSchema");

const updateInstructorSchema = Joi.object({
  courseIds: Joi.array()
    .items(
      Joi.string()
        .pattern(/^[a-zA-Z0-9_-]{1,64}$/)
        .required(),
    )
    .max(50),
  name: Joi.string().trim().min(1).max(200),
  email: Joi.string().trim().email().max(320),
}).min(1);

async function syncInstructor(req, res) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await connectDB();

    const clerkUser = await clerkClient.users.getUser(userId);
    const existingRole = clerkUser.publicMetadata?.role;

    if (existingRole) {
      return res.json({
        role: existingRole,
        courseIds: clerkUser.publicMetadata?.courseIds ?? [],
      });
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress?.toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "No email found for this user" });
    }

    const instructor = await Instructor.findOne({ email }).collation({
      locale: "en",
      strength: 2,
    });

    if (!instructor) {
      return res.status(404).json({ error: "No matching account found" });
    }

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "instructor",
        courseIds: instructor.courseIds,
      },
    });

    if (!instructor.clerkId) {
      instructor.clerkId = userId;
      await instructor.save();
    }

    console.log(
      `Lazy sync: ${email} → instructor (courses: ${instructor.courseIds.join(", ")})`,
    );

    res.json({ role: "instructor", courseIds: instructor.courseIds });
  } catch (err) {
    console.error("syncInstructor error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateInstructor(req, res) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await connectDB();

    if (!/^[a-fA-F0-9]{24}$/.test(req.params.id)) {
      return res.status(400).json({ error: "Invalid instructor ID format" });
    }

    const { error: validationError, value: validBody } =
      updateInstructorSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

    if (validationError) {
      const messages = validationError.details.map((detail) => detail.message);
      return res.status(400).json({ error: messages.join("; ") });
    }

    const callerClerkUser = await clerkClient.users.getUser(userId);
    const callerRole = callerClerkUser.publicMetadata?.role;

    if (callerRole !== "admin") {
      return res
        .status(403)
        .json({
          error: "Forbidden: only admins can update instructor records",
        });
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

    if (instructor.clerkId) {
      await clerkClient.users.updateUserMetadata(instructor.clerkId, {
        publicMetadata: {
          role: "instructor",
          courseIds: instructor.courseIds,
        },
      });
      console.log(
        `Admin updated instructor ${instructor.email} courses → [${instructor.courseIds.join(", ")}] and synced to Clerk`,
      );
    } else {
      console.log(
        `Admin updated instructor ${instructor.email} courses → [${instructor.courseIds.join(", ")}] (Clerk sync pending next login)`,
      );
    }

    res.json(instructor);
  } catch (err) {
    console.error("updateInstructor error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { syncInstructor, updateInstructor };
