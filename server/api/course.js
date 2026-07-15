const { getAuth, clerkClient } = require("@clerk/express");
const Joi = require("joi");
const Course = require("../Schema/courseSchema");
const Registration = require("../Schema/registrationSchema");

// ── Joi schemas for input validation ─────────────────────────────────────────
const videoSchema = Joi.object({
  type: Joi.string().valid("video", "text").default("video"),
  order: Joi.number().integer().min(1).required(),
  url: Joi.string().uri().max(2048).allow("", null).optional(),
  title: Joi.string().trim().max(200).required(),
  duration: Joi.number().min(0).allow(null).optional(),
  description: Joi.string().trim().max(2000).required(),
  content: Joi.string().allow("", null).optional(),
});

const updateCourseSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().min(1).max(5000),
  instructor: Joi.string().trim().min(1).max(200),
  duration: Joi.number().min(0),
  videos: Joi.array().items(videoSchema).max(200),
}).min(1);  // require at least one field

/**
 * GET /api/courses/:courseId
 *
 * Fetches course details by courseId.
 * Auth is verified via getAuth(req) — the @clerk/express v2 way.
 * clerkMiddleware() must run before this handler (applied globally in index.js).
 */
async function getCourse(req, res) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.params.courseId) {
      return res.status(400).json({ error: "Missing courseId parameter" });
    }

    // Validate courseId format (alphanumeric, hyphens, underscores — max 64 chars)
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(req.params.courseId)) {
      return res.status(400).json({ error: "Invalid courseId format" });
    }

    // Fetch the Clerk user to verify their role and assigned course
    const clerkUser = await clerkClient.users.getUser(userId);
    const role = clerkUser.publicMetadata?.role;
    const assignedCourseId = clerkUser.publicMetadata?.courseId;         // student (single)
    const assignedCourseIds = clerkUser.publicMetadata?.courseIds ?? []; // instructor (array)

    if (!role || (role !== "admin" && role !== "instructor" && role !== "student")) {
      return res.status(403).json({ error: "Forbidden: Invalid or missing role" });
    }

    if (role === "student" && assignedCourseId !== req.params.courseId) {
      return res
        .status(403)
        .json({ error: "Forbidden: You are not enrolled in this course" });
    }

    if (role === "instructor" && !assignedCourseIds.includes(req.params.courseId)) {
      return res
        .status(403)
        .json({ error: "Forbidden: You are not authorized to view this course" });
    }

    const course = await Course.findOne({ courseId: req.params.courseId });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const courseData = course.toObject();

    // Only include enrollment data for admins and instructors — never for students
    if (role === "admin" || role === "instructor") {
      const registrations = await Registration.find({ courseId: course.courseId }).lean();
      courseData.studentsEnrolled = registrations.map((r) => ({
        studentId: r._id.toString(),
        studentName: r.name,
        email: r.email,
        status: r.status,
      }));
    }

    res.json(courseData);
  } catch (err) {
    console.error("getCourse error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PUT /api/courses/:courseId
 *
 * Updates course details by courseId.
 * Enforces role restrictions: only admins or the assigned instructor can update.
 */
async function updateCourse(req, res) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!req.params.courseId) {
      return res.status(400).json({ error: "Missing courseId parameter" });
    }

    // Validate courseId format (alphanumeric, hyphens, underscores — max 64 chars)
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(req.params.courseId)) {
      return res.status(400).json({ error: "Invalid courseId format" });
    }

    // Validate request body with Joi before touching the DB
    const { error: validationError, value: validBody } = updateCourseSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,  // silently drop unexpected fields
    });

    if (validationError) {
      const messages = validationError.details.map((d) => d.message);
      return res.status(400).json({ error: messages.join("; ") });
    }

    // Fetch the Clerk user to verify their role and assigned course
    const clerkUser = await clerkClient.users.getUser(userId);
    const role = clerkUser.publicMetadata?.role;
    const assignedCourseIds = clerkUser.publicMetadata?.courseIds ?? []; // instructor (array)

    if (!role || (role !== "admin" && role !== "instructor")) {
      return res.status(403).json({ error: "Forbidden: Invalid or insufficient permissions" });
    }

    if (role === "instructor" && !assignedCourseIds.includes(req.params.courseId)) {
      return res
        .status(403)
        .json({ error: "Forbidden: You are not authorized to manage this course" });
    }

    const { title, description, instructor, duration, videos } = validBody;

    const course = await Course.findOne({ courseId: req.params.courseId });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (instructor !== undefined) course.instructor = instructor;
    if (duration !== undefined) course.duration = duration;
    if (videos !== undefined) course.videos = videos;

    await course.save();

    res.json(course);
  } catch (err) {
    // Mongoose validation error — return 400 with field-level details
    if (err.name === "ValidationError") {
      const fields = Object.values(err.errors).map((e) => {
        // e.path is the field name, e.message is Mongoose's default message
        // We produce a friendlier label for known fields.
        const labels = {
          instructor: "Instructor Display Name",
          title: "Course Title",
          description: "Course Description",
        };
        const label = labels[e.path] || e.path;
        return `"${label}" is required`;
      });
      return res.status(400).json({
        error: `Please fill in the following required fields: ${fields.join(", ")}.`,
      });
    }

    console.error("updateCourse error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getCourse, updateCourse };

