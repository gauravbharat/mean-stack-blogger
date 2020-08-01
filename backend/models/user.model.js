const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// Create a blueprint of how User data should look like
// _id is generated automatically by mongoose
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Add unique email/userId validation plugin
userSchema.plugin(uniqueValidator);

// In order to actually create data or model objects based on the blueprint =>
module.exports = mongoose.model("User", userSchema);
