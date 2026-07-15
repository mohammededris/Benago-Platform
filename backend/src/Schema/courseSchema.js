const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  courseId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  instructor: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
  },
  videos: [
    {
      type: {
        type: String,
        enum: ["video", "text"],
        default: "video",
      },
      order: {
        type: Number,
        required: true,
      },
      url: {
        type: String,
      },
      title: {
        type: String,
        required: true,
      },
      duration: {
        type: Number,
      },
      description: {
        type: String,
        required: true,
      },
      content: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
