const express = require("express");
const authController = require("./../controllers/authController");
const notificationController = require("./../controllers/notificationController");

const router = express.Router();

router
   .route("/")
   .get(authController.protect, notificationController.getNotifications);

router
   .route("/:notifId")
   .post(authController.protect, notificationController.friendNotification);

module.exports = router;
