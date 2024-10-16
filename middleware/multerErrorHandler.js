// middleware/multerErrorHandler.js
const multer = require("multer");

const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.log(err)
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File size is too large. Maximum limit is 5MB." });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res
        .status(400)
        .json({ message: "Unexpected field. Please upload an image file." });
    }
    // Handle Multer-specific errors
    return res.status(400).json({ message: err.message });
  } else if (err) {
    // Handle other errors
    return res.status(500).json({ message: err.message });
  }
  next();
};

module.exports = multerErrorHandler;
