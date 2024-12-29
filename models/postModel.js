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
      required: true,
   },
   content: {
      type: String,
      required: false,
   },
   comments: {
      type: [commentSchema],
   },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
