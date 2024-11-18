const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const User = require("./../models/userModel");

exports.getUserProfile = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
});

exports.createUserProfile = catchAsync(async (req, res, next) => {
  if (!req.body.firstName || !req.body.lastName) {
    return next(new AppError("Enter your data.\n", 400));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      birthday: req.body.birthday || "",
      firstLogin: false,
    },
    {
      runValidators: true,
      new: true,
    }
  );

  if (req.file) {
    updatedUser.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
  }

  if (!updatedUser) {
    return next(new AppError("User could not be updated.\n", 400));
  }

  res.status(200).json({
    status: "success",
    data: {
      updatedUser,
    },
  });
});
