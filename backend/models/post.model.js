const mongoose = require("mongoose");

// Create a blueprint of how Post data look like
// _id is generated automatically by mongoose
const postSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imagePath: { type: String, required: true },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// In order to actually create data or model objects based on the blueprint =>
module.exports = mongoose.model("Post", postSchema);
