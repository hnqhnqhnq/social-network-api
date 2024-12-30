const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("./../controllers/userController");
const uploadPicture = require("./../utils/multerConfig");
const {
   setPictureHeader,
} = require("./../utils/requestHeaderPictureMiddleWare");

const router = express.Router();

// Routes for auth
router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/signout").get(authController.signout);

// Routes for user data
router.route("/me").get(authController.protect, userController.getUserProfile);
router
   .route("/updateProfile")
   .post(
      authController.protect,
      setPictureHeader("profile"),
      uploadPicture.single("profilePicture"),
      userController.updateUserProfile
   );

router.route("/search").get(authController.protect, userController.searchUser);

router.route("/:userId").get(authController.protect, userController.getProfile);

module.exports = router;
