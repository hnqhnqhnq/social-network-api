const Post = require("./../models/postModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");

exports.createPost = catchAsync(async (req, res, next) => {
   if (req.files && req.files.length > 0) {
      req.body.mediaFiles = req.files.map((file) => "/" + file.path);
   } else {
      return next(new AppError("Provide media files!\n", 401));
   }

   const post = await Post.create({
      postedBy: req.user._id,
      content: req.body.content || "",
      mediaFiles: req.body.mediaFiles,
   });

   res.status(201).json({
      status: "success",
      data: {
         post,
      },
   });
});

exports.displayRecentPosts = catchAsync(async (req, res, next) => {
   const page = parseInt(req.query.page) || 1;
   const limit = parseInt(req.query.limit) || 100;
   const skip = (page - 1) * limit;

   const posts = await Post.find()
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("postedBy", "username profilePicture");

   if (!posts) {
      return next(new AppError("No posts!\n", 404));
   }

   res.status(200).json({
      status: "success",
      data: {
         length: posts.length,
         posts,
      },
   });
});

exports.displayMyPosts = catchAsync(async (req, res, next) => {
   const posts = await Post.find({ postedBy: req.user._id }).sort({
      createdAt: -1,
   });

   if (!posts) {
      return next(new AppError("No posts!\n", 404));
   }

   res.status(200).json({
      status: "success",
      data: {
         length: posts.length,
         posts,
      },
   });
});

exports.displayUserPosts = catchAsync(async (req, res, next) => {
   const posts = await Post.find({ postedBy: req.params.userId }).sort({
      createdAt: -1,
   });

   if (!posts) {
      return next(new AppError("No posts!\n", 404));
   }

   res.status(200).json({
      status: "success",
      data: {
         length: posts.length,
         posts,
      },
   });
});

exports.displayOnePost = catchAsync(async (req, res, next) => {
   const post = await Post.findOne({
      _id: req.params.postId,
   }).populate("postedBy", "username profilePicture");

   if (!post) {
      return next(new AppError("No post!\n", 404));
   }

   res.status(200).json({
      status: "success",
      data: {
         post,
      },
   });
});

exports.updatePost = catchAsync(async (req, res, next) => {
   const updatedPost = await Post.findOne({
      _id: req.params.postId,
      postedBy: req.user._id,
   });
   if (!updatedPost) {
      return next(new AppError("Post not found!\n", 404));
   }

   if (req.body.content) {
      updatedPost.content = req.body.content;
   }

   if (req.files && req.files.length > 0) {
      req.body.mediaFiles = req.files.map((file) => "/" + file.path);
      updatedPost.mediaFiles = [...req.body.mediaFiles];
   } else {
      return next(new AppError("Provide media files!\n", 401));
   }

   await updatedPost.save();

   res.status(200).json({
      status: "success",
      data: {
         updatedPost,
      },
   });
});

exports.deletePost = catchAsync(async (req, res, next) => {
   const post = await Post.findOneAndDelete({
      _id: req.params.postId,
      postedBy: req.user._id,
   });

   if (!post) {
      return next(new AppError("Not this user's post!\n", 403));
   }

   res.status(204).json({
      status: "success",
      data: null,
   });
});
