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

   let posts = await Post.find()
      .sort({ postedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("postedBy", "_id username profilePicture");

   if (!posts) {
      return next(new AppError("No posts!\n", 404));
   }

   posts = posts.filter((post) => req.user.friends.includes(post.postedBy._id));

   res.status(200).json({
      status: "success",
      data: {
         length: posts.length,
         posts,
      },
   });
});

exports.displayMyPosts = catchAsync(async (req, res, next) => {
   const posts = await Post.find({ postedBy: req.user._id })
      .sort({
         createdAt: -1,
      })
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

exports.displayUserPosts = catchAsync(async (req, res, next) => {
   const posts = await Post.find({ postedBy: req.params.userId })
      .sort({
         createdAt: -1,
      })
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
   }).populate("postedBy", "username profilePicture");
   if (!updatedPost) {
      return next(new AppError("Post not found!\n", 404));
   }

   if (req.body.like !== undefined) {
      if (req.body.like) {
         updatedPost.likesCount++;
         updatedPost.likedBy.push(req.user._id);
      } else if (!req.body.like) {
         updatedPost.likesCount--;
         updatedPost.likedBy = updatedPost.likedBy.filter(
            (id) => id.toString() != req.user._id.toString()
         );
      }
   }

   if (req.body.share !== undefined) {
      if (req.body.share) {
         updatedPost.sharedBy.push(req.user._id);
      }
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

exports.checkLikeState = catchAsync(async (req, res, next) => {
   const post = await Post.findById(req.params.postId);
   if (!post) {
      return next(new AppError("Post not found!\n", 404));
   }

   const like = post.likedBy.some(
      (id) => id.toString() === req.user._id.toString()
   );

   res.status(200).json({
      status: "success",
      like: like,
   });
});

exports.getMySharedPosts = catchAsync(async (req, res, next) => {
   const posts = await Post.find({ sharedBy: req.user._id }).populate(
      "postedBy",
      "username profilePicture"
   );
   if (!posts || posts.length === 0) {
      return next(new AppError("Post not found!\n", 404));
   }

   res.status(200).json({
      status: "success",
      length: posts.length,
      data: {
         posts,
      },
   });
});

exports.getUserSharedPosts = catchAsync(async (req, res, next) => {
   const posts = await Post.find({ sharedBy: req.params.userId }).populate(
      "postedBy",
      "username profilePicture"
   );
   if (!posts || posts.length === 0) {
      return next(new AppError("Post not found!\n", 404));
   }

   res.status(200).json({
      status: "success",
      length: posts.length,
      data: {
         posts,
      },
   });
});
