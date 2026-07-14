const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "pending", "inactive"],
      default: "active",
    },
  },
  { timestamps: true },
);

registrationSchema.index(
  { email: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } },
);

module.exports = mongoose.model("Registration", registrationSchema);
