const { getAuth, clerkClient } = require("@clerk/express");
const Joi = require("joi");
const connectDB = require("../lib/connectDB");
const Course = require("../Schema/courseSchema");
const Registration = require("../Schema/registrationSchema");

const videoSchema = Joi.object({
  order: Joi.number().integer().min(1).required(),
  url: Joi.string().uri().max(2048).required(),
  title: Joi.string().trim().max(200).required(),
  duration: Joi.number().min(0).required(),
  description: Joi.string().trim().max(2000).required(),
});

const updateCourseSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200),
  description: Joi.string().trim().min(1).max(5000),
  instructor: Joi.string().trim().min(1).max(200),
  duration: Joi.number().min(0),
  videos: Joi.array().items(videoSchema).max(200),
}).min(1);

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

    const clerkUser = await clerkClient.users.getUser(userId);
    const role = clerkUser.publicMetadata?.role;
    const assignedCourseId = clerkUser.publicMetadata?.courseId;
    const assignedCourseIds = clerkUser.publicMetadata?.courseIds ?? [];

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

    const course = await Course.findOne({ courseId: req.params.courseId });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const courseData = course.toObject();

    if (role === "admin" || role === "instructor") {
      const registrations = await Registration.find({
        courseId: course.courseId,
      }).lean();
      courseData.studentsEnrolled = registrations.map((registration) => ({
        studentId: registration._id.toString(),
        studentName: registration.name,
        email: registration.email,
        status: registration.status,
      }));
    }

    res.json(courseData);
  } catch (err) {
    console.error("getCourse error:", err);
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

    const clerkUser = await clerkClient.users.getUser(userId);
    const role = clerkUser.publicMetadata?.role;
    const assignedCourseIds = clerkUser.publicMetadata?.courseIds ?? [];

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

module.exports = { getCourse, updateCourse };
