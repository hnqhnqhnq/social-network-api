const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Notification = require("./../models/notificationModel");
const User = require("../models/userModel");

exports.getNotifications = catchAsync(async (req, res, next) => {
   const notifications = await Notification.find({
      to: req.user._id,
      deleted: false,
   }).populate("from", "profilePicture username");

   if (!notifications) {
      return next(new AppError("No notifications\n", 404));
   }

   res.status(200).json({
      status: "success",
      length: notifications.length,
      data: {
         notifications,
      },
   });
});

exports.friendNotification = catchAsync(async (req, res, next) => {
   const notif = await Notification.findOne({
      _id: req.params.notifId,
      deleted: false,
   });
   if (!notif) {
      return next(new AppError("Not found\n", 404));
   }

   const toUser = await User.findById(notif.to);
   const fromUser = await User.findById(notif.from);

   if (req.body.decision !== undefined) {
      if (req.body.decision) {
         toUser.friends.push(fromUser);
         fromUser.friends.push(toUser);
         toUser.friendsCount++;
         fromUser.friendsCount++;
      }

      notif.deleted = true;
   }

   await notif.save();
   await toUser.save();
   await fromUser.save();

   res.status(200).json({
      status: "success",
      data: {
         notif,
      },
   });
});
