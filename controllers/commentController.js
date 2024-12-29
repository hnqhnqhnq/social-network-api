const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Post = require("./../models/postModel");
const { Comment } = require("./../models/commentModel");

exports.addCommentToPost = catchAsync(async (req, res, next) => {
   const post = await Post.findById(req.params.postId);

   if (!post) {
      return next(new AppError("Post not found.\n", 404));
   }

   if (!req.body.content) {
      return next(new AppError("The comment must have a content.\n", 400));
   }

   const comment = await Comment.create({
      commentedBy: req.user._id,
      post: req.params.postId,
      content: req.body.content,
   });

   if (!comment) {
      return next(new AppError("The comment must have a content.\n", 400));
   }

   post.comments.push(comment);
   await post.save();

   res.status(200).json({
      status: "success",
      data: {
         post,
      },
   });
});

exports.getCommentsOfAPost = catchAsync(async (req, res, next) => {
   const post = await Post.findById(req.params.postId).populate({
      path: "comments.commentedBy",
      select: "username profilePicture",
   });

   if (!post) {
      return next(new AppError("Post not found.\n", 404));
   }

   const comments = [...post.comments];

   res.status(200).json({
      status: "success",
      data: {
         comments,
      },
   });
});
