const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
   chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: [true, "Please provide chat\n"],
   },
   sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide sender\n"],
   },
   receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please provide receiver\n"],
   },
   content: {
      type: String,
      required: [true, "Write a message"],
   },
   sentAt: {
      type: Date,
      default: Date.now,
   },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
