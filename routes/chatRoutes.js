const express = require("express");
const authController = require("./../controllers/authController");
const chatController = require("./../controllers/chatController");

const router = express.Router();

router
   .route("/")
   .post(authController.protect, chatController.createChat)
   .get(authController.protect, chatController.getChats);

router
   .route("/message")
   .post(authController.protect, chatController.sendMessage);

router
   .route("/message/:chatId")
   .get(authController.protect, chatController.getMessages);

module.exports = router;
