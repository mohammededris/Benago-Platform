const { getAuth, clerkClient } = require("@clerk/express");
const { withTimeout } = require("../lib/withTimeout");
const Joi = require("joi");
const connectDB = require("../lib/connectDB");
const Course = require("../Schema/courseSchema");
const Registration = require("../Schema/registrationSchema");

const CLERK_API_TIMEOUT_MS = 8000;

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
}).min(1);

async function getUserRoleAndMetadata(req, userId) {
  const { sessionClaims } = getAuth(req);
  const metadata = sessionClaims?.publicMetadata || sessionClaims?.public_metadata;

  // Fast path: role is already in the JWT — no Clerk API call needed.
  if (metadata && metadata.role) {
    return {
      role: metadata.role,
      courseId: metadata.courseId ?? null,
      courseIds: Array.isArray(metadata.courseIds) ? metadata.courseIds : [],
    };
  }

  // Slow path: role not in JWT — must call Clerk API. Guarded with a hard timeout.
  try {
    const clerkUser = await withTimeout(
      clerkClient.users.getUser(userId),
      CLERK_API_TIMEOUT_MS,
      "clerkClient.users.getUser (getUserRoleAndMetadata)",
    );
    return {
      role: clerkUser.publicMetadata?.role,
      courseId: clerkUser.publicMetadata?.courseId ?? null,
      courseIds: Array.isArray(clerkUser.publicMetadata?.courseIds)
        ? clerkUser.publicMetadata.courseIds
        : [],
    };
  } catch (err) {
    console.error(`Error fetching user ${userId} metadata from Clerk:`, err.message);
    return { role: null, courseId: null, courseIds: [] };
  }
}

async function getCourse(req, res) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await connectDB();

    if (!req.params.courseId) {
      return res.status(400).json({ error: "Missing courseId parameter" });
    }

    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(req.params.courseId)) {
      return res.status(400).json({ error: "Invalid courseId format" });
    }

    const { role, courseId: assignedCourseId, courseIds: assignedCourseIds } =
      await getUserRoleAndMetadata(req, userId);

    if (
      !role ||
      (role !== "admin" && role !== "instructor" && role !== "student")
    ) {
      return res
        .status(403)
        .json({ error: "Forbidden: Invalid or missing role" });
    }

    if (role === "student" && assignedCourseId !== req.params.courseId) {
      return res
        .status(403)
        .json({ error: "Forbidden: You are not enrolled in this course" });
    }

    if (
      role === "instructor" &&
      !assignedCourseIds.includes(req.params.courseId)
    ) {
      return res
        .status(403)
        .json({
          error: "Forbidden: You are not authorized to view this course",
        });
    }

    const course = await Course.findOne({ courseId: req.params.courseId }).lean();

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    if (role === "admin" || role === "instructor") {
      course.enrollmentCount = await Registration.countDocuments({
        courseId: course.courseId,
      });
    }

    res.json(course);
  } catch (err) {
    console.error("getCourse error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getCourseStudents(req, res) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { courseId } = req.params;
    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(courseId || "")) {
      return res.status(400).json({ error: "Invalid courseId format" });
    }

    const { role, courseIds: assignedCourseIds } =
      await getUserRoleAndMetadata(req, userId);

    if (!role || (role !== "admin" && role !== "instructor")) {
      return res
        .status(403)
        .json({ error: "Forbidden: insufficient permissions" });
    }

    if (role === "instructor" && !assignedCourseIds.includes(courseId)) {
      return res
        .status(403)
        .json({ error: "Forbidden: You are not authorized to view this course" });
    }

    const requestedPage = Number.parseInt(req.query.page, 10);
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const page = Number.isFinite(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, 100)
      : 25;

    const filter = { courseId };
    const [total, registrations] = await Promise.all([
      Registration.countDocuments(filter),
      Registration.find(filter)
        .select({ name: 1, email: 1, status: 1 })
        .sort({ _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    res.json({
      students: registrations.map((registration) => ({
        studentId: registration._id.toString(),
        studentName: registration.name,
        email: registration.email,
        status: registration.status,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getCourseStudents error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateCourse(req, res) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await connectDB();

    if (!req.params.courseId) {
      return res.status(400).json({ error: "Missing courseId parameter" });
    }

    if (!/^[a-zA-Z0-9_-]{1,64}$/.test(req.params.courseId)) {
      return res.status(400).json({ error: "Invalid courseId format" });
    }

    const { error: validationError, value: validBody } =
      updateCourseSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

    if (validationError) {
      const messages = validationError.details.map((detail) => detail.message);
      return res.status(400).json({ error: messages.join("; ") });
    }

    const { role, courseIds: assignedCourseIds } =
      await getUserRoleAndMetadata(req, userId);

    if (!role || (role !== "admin" && role !== "instructor")) {
      return res
        .status(403)
        .json({ error: "Forbidden: Invalid or insufficient permissions" });
    }

    if (
      role === "instructor" &&
      !assignedCourseIds.includes(req.params.courseId)
    ) {
      return res
        .status(403)
        .json({
          error: "Forbidden: You are not authorized to manage this course",
        });
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
    if (err.name === "ValidationError") {
      const fields = Object.values(err.errors).map((validationField) => {
        const labels = {
          instructor: "Instructor Display Name",
          title: "Course Title",
          description: "Course Description",
        };
        const label = labels[validationField.path] || validationField.path;
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

module.exports = { getCourse, getCourseStudents, updateCourse };
