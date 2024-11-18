const mongoose = require("mongoose");

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
});
