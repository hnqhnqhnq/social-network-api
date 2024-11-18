const Post = require("./../models/postModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");

exports.createPost = catchAsync(async (req, res, next) => {
  if (!req.body.mediaFiles || req.body.mediaFiles.length === 0) {
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
