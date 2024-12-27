exports.setPictureHeader = (type) => {
   return (req, res, next) => {
      req.picture = type;
      next();
   };
};
