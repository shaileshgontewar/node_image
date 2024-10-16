const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const Image = require("../models/Image");
const router = express.Router();

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // { recursive: true } ensures that all directories are created
}
// Check Directory: Using fs.existsSync() to check if the uploads folder exists.
// Create Directory: Using fs.mkdirSync() to create the folder if it doesn't exist.
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Extract the original file extension (e.g., .jpg, .png, etc.)
    const extension = path.extname(file.originalname); // Get the file extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension); // Append the extension to the unique filename
  },
});
const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file, "req.file");
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }
    const { description } = req.body;
    const newImage = new Image({
      filename: req.file.filename,
      description,
    });
    await newImage.save();
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`; // Construct the URL to access the image
    res.status(201).json({ file: req.file, description, imageUrl });
  } catch (error) {
    res.status(500).json({
      msg: "Failed",
      error,
    });
  }
});

module.exports = router;

// const upload = multer({
//     storage,
//     fileFilter: (req, file, cb) => {
//       const filetypes = /jpeg|jpg|png|gif/; // Allowed file extensions
//       const mimetype = filetypes.test(file.mimetype); // Check MIME type
//       const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); // Check file extension

//       if (mimetype && extname) {
//         return cb(null, true); // Accept file
//       }
//       cb(new Error('Only images are allowed!')); // Reject file if not an image
//     }
//   });
