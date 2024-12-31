const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const Chat = require("./../models/chatModel");
const User = require("./../models/userModel");
const Message = require("./../models/messageModel");

exports.createChat = catchAsync(async (req, res, next) => {
   const user1 = await User.findById(req.body.id1);
   const user2 = await User.findById(req.body.id2);

   if (!user1 || !user2 || req.body.id1.toString() == req.body.id2.toString()) {
      return next(new AppError("Both users are required"));
   }

   let existingChat = await Chat.findOne({
      $or: [
         { user1: req.body.id1, user2: req.body.id2 },
         { user1: req.body.id2, user2: req.body.id1 },
      ],
   });

   if (existingChat) {
      return next(new AppError("Chat already exists!", 404));
   }

   const newChat = await Chat.create({
      user1: req.body.id1,
      user2: req.body.id2,
   });

   if (!newChat) {
      return next(new AppError("Couldn't create new!", 404));
   }

   res.status(200).json({
      status: "success",
      data: {
         newChat,
      },
   });
});

exports.getChats = catchAsync(async (req, res, next) => {
   const chats = await Chat.find({
      $or: [{ user1: req.user._id }, { user2: req.user._id }],
      lastMessage: { $ne: "" },
   })
      .sort({ lastMessageSent: -1 })
      .populate("user1", "username profilePicture")
      .populate("user2", "username profilePicture");

   if (!chats || chats.length === 0) {
      return next(new AppError("No chats found", 404));
   }

   res.status(200).json({
      status: "success",
      results: chats.length,
      data: {
         chats,
      },
   });
});

exports.sendMessage = catchAsync(async (req, res, next) => {
   const { sender, receiver, content, chat } = req.body;

   if (!sender || !receiver || !content || !chat) {
      return next(
         new AppError("Sender, receiver, and content are required", 400)
      );
   }

   const senderUser = await User.findById(sender);
   const receiverUser = await User.findById(receiver);
   const thisChat = await Chat.findById(chat);

   if (!senderUser || !receiverUser || !thisChat) {
      return next(new AppError("Sender or receiver or chat not found", 404));
   }

   const newMessage = await Message.create({
      chat,
      sender,
      receiver,
      content,
   });

   thisChat.lastMessage = content;
   thisChat.lastMessageSent = newMessage.sentAt;
   await thisChat.save();

   res.status(201).json({
      status: "success",
      data: {
         message: newMessage,
      },
   });
});

exports.getMessages = catchAsync(async (req, res, next) => {
   const messages = await Message.find({ chat: req.params.chatId })
      .sort({ sentAt: 1 })
      .populate("sender", "username profilePicture")
      .populate("receiver", "username profilePicture");

   if (!messages) {
      return next(new AppError("no messages\n", 404));
   }

   res.status(200).json({
      status: "success",
      data: {
         messages,
      },
   });
});
