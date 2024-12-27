const multer = require("multer");
const path = require("path");
const AppError = require("./appError");

const allowedFileTypes = /jpeg|jpg|png|gif/;

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      if (req.picture == "profile") cb(null, "uploads/profile-pictures/");
      else if (req.picture == "posts") cb(null, "uploads/posts/");
   },
   filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
   },
});

const fileFilter = (req, file, cb) => {
   const fileExt = path.extname(file.originalname).toLowerCase();
   const mimeType = file.mimetype;

   if (allowedFileTypes.test(fileExt) && mimeType.startsWith("image/")) {
      cb(null, true);
   } else {
      cb(new AppError("Only image files are allowed!\n", 401), false);
   }
};

const uploadPicture = multer({
   storage: storage,
   fileFilter: fileFilter,
});

module.exports = uploadPicture;
