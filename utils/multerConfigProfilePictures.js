const multer = require("multer");
const path = require("path");
const AppError = require("./appError");

const allowedFileTypes = /jpeg|jpg|png|gif/;

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, "uploads/profile-pictures/");
   },
   filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
   },
});

const fileFilter = (req, file, cb) => {
   const fileExt = path.extname(file.originalname).toLowerCase();
   const mimeType = file.mimetype;

   if (
      allowedFileTypes.test(fileExt) &&
      mimeType.startsWith("image/")
   ) {
      cb(null, true);
   } else {
      cb(new AppError("Only image files are allowed!\n", 401), false);
   }
};

const uploadProfilePicture = multer({
   storage: storage,
   fileFilter: fileFilter,
});

module.exports = uploadProfilePicture;
