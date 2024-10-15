const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

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
