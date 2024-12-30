const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const User = require("./../models/userModel");
const Notification = require("./../models/notificationModel");

exports.getUserProfile = catchAsync(async (req, res, next) => {
   res.status(200).json({
      status: "success",
      data: {
         user: req.user,
      },
   });
});

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
         bio: req.body.bio || req.user.bio,
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

exports.searchUser = catchAsync(async (req, res, next) => {
   const searchTerm = req.query.q;
   const regex = new RegExp(searchTerm, "i");

   const users = await User.find({ username: regex });

   res.status(200).json({
      status: "success",
      results: users.length,
      data: { users },
   });
});

exports.sendFriendRequest = catchAsync(async (req, res, next) => {
   if (!req.body.to) {
      return next(new AppError("Must have to.\n", 401));
   }

   const notification1 = await Notification.findOne({
      from: req.user._id,
      to: req.body.to,
      deleted: false,
   });

   const notification2 = await Notification.findOne({
      to: req.user._id,
      from: req.body.to,
      deleted: false,
   });

   if (notification1 || notification2) {
      return next(new AppError("No duplicate notifications.\n", 401));
   }

   if (req.user._id.toString() == req.body.to.toString()) {
      return next(new AppError("No self friend request.\n", 401));
   }

   if (req.user.friends.includes(req.body.to.toString())) {
      return next(new AppError("No 2 same friends.\n", 401));
   }

   const newNotification = await Notification.create({
      from: req.user._id,
      to: req.body.to,
   });
   if (!newNotification) {
      return next(new AppError("Not new notification!\n", 404));
   }

   res.status(200).json({
      status: "success",
      data: {
         newNotification,
      },
   });
});

exports.getFriends = catchAsync(async (req, res, next) => {
   const user = await req.user.populate(
      "friends",
      "profilePicture username bio"
   );
   const friends = user.friends;

   res.status(200).json({
      status: "success",
      length: user.friendsCount,
      data: {
         friends: friends,
      },
   });
});

exports.getFriendsOfUser = catchAsync(async (req, res, next) => {
   const user = await User.findById(req.params.userId).populate(
      "friends",
      "profilePicture username bio"
   );
   const friends = user.friends;

   res.status(200).json({
      status: "success",
      length: user.friendsCount,
      data: {
         friends: friends,
      },
   });
});
