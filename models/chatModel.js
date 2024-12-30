const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
   user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user1\n"],
   },
   user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide user2\n"],
   },
   lastMessage: {
      type: String,
      default: "",
   },
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
