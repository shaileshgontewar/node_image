const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const Image = require("../models/Image");
const validateObjectId = require("../middleware/validateObjectId");
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
    const extension = path.extname(file.originalname);
    const uniqueSuffix = Date.now();
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});
const upload = multer({ storage });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file, "req.file");
    if (!req.file) {
      return res.status(400).json({ msg: "Image file is required" });
    }
    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }
    const newImage = new Image({
      imageUrl: req.file.filename,
      description,
    });
    await newImage.save();
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`; // Construct the URL to access the image
    res.status(201).json({ file: req.file, description, imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/upload/:id", upload.single("image"), async (req, res, next) => {
  try {
    const { description } = req.body;
    const { id } = req.params;

    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    if (description) image.description = description;
    if (req.file) {
      const oldPath = path.join(__dirname, "../uploads", image.imageUrl);
      fs.unlink(oldPath, (err) => {
        if (err) console.error("Failed to delete old image:", err);
      });

      image.imageUrl = req.file.filename;
    }

    const updateImage = await image.save();
    res.status(200).json(updateImage);
  } catch (error) {
    next(error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/upload", async (req, res) => {
  try {
    let image;
    image = await Image.find().sort({ createdAt: -1 });
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    res.status(200).json(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/upload/:id", validateObjectId, async (req, res) => {
  try {
    const { id } = req.params;
    let image;
    image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
    res.status(200).json(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/upload/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findByIdAndDelete(id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    const imagePath = path.join(
      __dirname,
      "../uploads",
      path.basename(image.imageUrl)
    );
    console.log(imagePath, "imagePath");
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Failed to delete image file:", err);
      }
    });
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post(
  "/multiple-upload",
  upload.array("images", 10),
  async (req, res) => {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }
      if (!req.files || req.files.length === 0) {
        return res
          .status(400)
          .json({ msg: "At least one image file is required" });
      }
      const imageData = req.files.map((file) => ({
        description,
        imageUrl: file.filename,
      }));

      const saveImage = await Image.insertMany(imageData);
      res.status(201).json(saveImage);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
