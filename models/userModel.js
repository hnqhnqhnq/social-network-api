const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: false,
    validate: [validator.isAlpha, "Please provide a valid first name.\n"],
  },
  lastName: {
    type: String,
    required: false,
    validate: [validator.isAlpha, "Please provide a valid last name.\n"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email.\n"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email.\n"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password.\n"],
    minLength: 8,
    select: false,
    validate: [validator.isAlphanumeric, "Please provide a valid password.\n"],
  },
  confirmPassword: {
    type: String,
    required: [true, "Please provide a password.\n"],
    minLength: 8,
    select: false,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords do not match.\n",
    },
  },
  firstLogin: {
    type: Boolean,
    default: true,
  },
  profilePicture: {
    type: String,
  },
  accountCreatedAt: {
    type: Date,
    default: Date.now,
  },
});
// Methods

// Verify password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Document middlewares

// Password encryption at creation
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;

  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
