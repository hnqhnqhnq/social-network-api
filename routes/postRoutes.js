const express = require("express");
const authController = require("./../controllers/authController");
const postController = require("./../controllers/postController");
const uploadPicture = require("./../utils/multerConfig");
const {
   setPictureHeader,
} = require("./../utils/requestHeaderPictureMiddleWare");

const router = express.Router();

router
   .route("/")
   .post(
      authController.protect,
      setPictureHeader("posts"),
      uploadPicture.array("media", 10),
      postController.createPost
   );
router
   .route("/recent")
   .get(authController.protect, postController.displayRecentPosts);

router
   .route("/myPosts")
   .get(authController.protect, postController.displayMyPosts);

router
   .route("/user/:userId")
   .get(authController.protect, postController.displayUserPosts);

router
   .route("/:postId")
   .get(authController.protect, postController.displayOnePost)
   .patch(
      authController.protect,
      setPictureHeader("posts"),
      uploadPicture.array("media", 10),
      postController.updatePost
   )
   .delete(authController.protect, postController.deletePost);

module.exports = router;
