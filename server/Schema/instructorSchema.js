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

instructorSchema.index({ email: 1 }, { collation: { locale: "en", strength: 2 } });

module.exports = mongoose.model("Instructor", instructorSchema);
