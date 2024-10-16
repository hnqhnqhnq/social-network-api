const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");

const router = express.Router();

// Routes for auth
router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/signout").get(authController.signout);

// Routes for user data
router.route("/me").get(authController.protect, userController.getUserProfile);
router
  .route("/createProfile")
  .post(authController.protect, userController.createUserProfile);

module.exports = router;
