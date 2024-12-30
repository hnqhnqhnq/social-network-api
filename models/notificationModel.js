const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
   from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Need from\n"],
   },
   to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Need to\n"],
   },
   deleted: {
      type: Boolean,
      default: false,
   },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
