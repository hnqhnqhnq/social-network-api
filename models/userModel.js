const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const crypto = require("crypto");

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
   username: {
      type: String,
      required: [true, "Please provide your username.\n"],
      unique: true,
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
      validate: [
         validator.isAlphanumeric,
         "Please provide a valid password.\n",
      ],
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
   birthDate: {
      type: String,
      required: false,
   },
   profilePicture: {
      type: String,
   },
   bio: {
      type: String,
   },
   friends: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
   },
   friendsCount: {
      type: Number,
      default: 0,
   },
   accountCreatedAt: {
      type: Date,
      default: Date.now,
   },
   resetToken: {
      type: String,
      select: false,
   },
   resetTokenExpirationDate: {
      type: Date,
      select: false,
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

userSchema.methods.createPasswordResetToken = function () {
   const resetToken = crypto.randomBytes(3).toString("hex");

   this.resetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

   if (process.env.NODE_ENV === "development") {
      console.log({ resetToken }, this.resetToken);
   }

   this.resetTokenExpirationDate = Date.now() + 10 * 60 * 1000;

   return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
