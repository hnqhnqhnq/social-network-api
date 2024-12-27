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

// exports.createUserProfile = catchAsync(async (req, res, next) => {
//    if (!req.body.firstName || !req.body.lastName) {
//       return next(new AppError("Enter your data.\n", 400));
//    }

//    const updatedUser = await User.findByIdAndUpdate(
//       req.user._id,
//       {
//          firstName: req.body.firstName,
//          lastName: req.body.lastName,
//          birthDate: req.body.birthDate || "",
//          firstLogin: false,
//       },
//       {
//          runValidators: true,
//          new: true,
//       }
//    );

//    if (!updatedUser) {
//       return next(new AppError("User could not be updated.\n", 400));
//    }

//    res.status(200).json({
//       status: "success",
//       data: {
//          updatedUser,
//       },
//    });
// });

exports.updateUserProfile = catchAsync(async (req, res, next) => {
   let profilePicUrl = null;
   if (req.file) {
      profilePicUrl = `/upload/profile-pictures/${req.file.filename}`;
   }

   const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
         username: req.body.username || req.user.username,
         firstName: req.body.firstName || req.user.firstName,
         lastName: req.body.lastName || req.user.lastName,
         birthDate: req.body.birthDate || req.user.birthDate,
         profilePicture: profilePicUrl || req.user.profilePicture,
      },
      {
         runValidators: true,
         new: true,
      }
   );

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

exports.getProfile = catchAsync(async (req, res, next) => {
   const user = await User.findById(req.params.userId);
   if (!user) {
      return next(new AppError("No user Found!\n", 404));
   }

   res.status(200).json({
      status: "success",
      data: {
         user,
      },
   });
});
