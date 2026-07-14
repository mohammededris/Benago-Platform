const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const instructorSchema = new Schema({
  courseIds: {
    type: [String],
    default: [],
  },
  clerkId: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Instructor", instructorSchema);
