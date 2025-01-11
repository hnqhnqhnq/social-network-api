const mongoose = require("mongoose");
const { commentSchema } = require("./commentModel");

const postSchema = mongoose.Schema({
   postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   postedAt: {
      type: Date,
      default: Date.now,
   },
   mediaFiles: {
      type: [String],
      required: false,
   },
   content: {
      type: String,
      required: false,
   },
   comments: {
      type: [commentSchema],
   },
   likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
   },
   likesCount: {
      type: Number,
      default: 0,
   },
   sharedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
   },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
