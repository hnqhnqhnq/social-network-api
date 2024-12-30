const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const sendEmail = require("./../utils/sendEmail");

const signToken = (id) => {
   return jwt.sign({ id: id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
   });
};

const createSendToken = (user, statusCode, res) => {
   const token = signToken(user.id);
   const cookieOptions = {
      expires: new Date(
         Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 1000 * 60 * 60 * 24
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
   };

   res.cookie("jwt", token, cookieOptions);

   user.password = undefined;

   res.setHeader("Cache-Control", "no-store");
   res.status(statusCode).json({
      status: "success",
      data: {
         user,
      },
   });
};

exports.signup = catchAsync(async (req, res, next) => {
   const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
   });

   if (!newUser) {
      return next(new AppError("User could not be created.\n", 400));
   }

   createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
   const { email, password } = req.body;

   if (!email || !password) {
      return next(new AppError("Enter all credentials.\n", 400));
   }

   const user = await User.findOne({ email: email }).select("+password");

   if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Invalid email or password.\n", 401));
   }

   createSendToken(user, 200, res);
});

exports.signout = catchAsync(async (req, res, next) => {
   res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
   });

   res.status(200).json({
      status: "success",
      message: "Logged out successfully!",
   });
});

exports.protect = catchAsync(async (req, res, next) => {
   if (!req.cookies || !req.cookies.jwt) {
      console.log("DA");
      return next(new AppError("User is not logged in.\n", 401));
   }

   const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
   );

   const user = await User.findById(decoded.id);
   if (!user) {
      return next(new AppError("User not found!", 404));
   }

   req.user = user;
   next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
   const user = await User.findOne({ email: req.body.email });
   if (!user) {
      return next(
         new AppError("There is no user with that email address"),
         404
      );
   }

   const resetToken = user.createPasswordResetToken();
   await user.save({ validateBeforeSave: false });

   console.log("sent");

   const message = `
  <p>Forgot your password? This it the reset code:</p>
  <p>${resetToken}</p>
  <p>If you didn’t request a password reset, please ignore this email.</p>`;

   try {
      await sendEmail({
         email: user.email,
         subject: "Your password reset token (valid 10 minutes)",
         message,
         html: message,
      });
      console.log("sent");
   } catch (err) {
      console.error("Error sending email:", err);
      user.resetToken = undefined;
      user.resetTokenExpirationDate = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
         new AppError("there was an error sending the email. Try again later!"),
         500
      );
   }

   res.status(200).json({
      status: "success",
      message: "Token sent to email!",
   });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
   const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

   const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpirationDate: { $gte: Date.now() },
   });
   if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
   }

   user.password = req.body.password;
   user.confirmPassword = req.body.confirmPassword;
   user.resetToken = undefined;
   user.resetTokenExpirationDate = undefined;
   await user.save();

   res.status(200).json({
      status: "success",
      message: "Password successfully updated!",
   });
});
