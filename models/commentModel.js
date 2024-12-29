const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
   commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
   },
   post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
   },
   content: {
      type: String,
      required: [true, "Please write something!\n"],
   },
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = {
   commentSchema,
   Comment,
};
