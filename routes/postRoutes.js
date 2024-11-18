const express = require("express");
const authController = require("./../controllers/authController");
const postController = require("./../controllers/postController");

const router = express.Router();

router.route("/").post(authController.protect, postController.createPost);

module.exports = router;
