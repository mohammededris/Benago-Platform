const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  courseId: {
    type: String,
    required: true,
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
      order: {
        type: Number,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      duration: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
