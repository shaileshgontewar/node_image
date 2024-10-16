const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const Image = require("../models/Image");
const Grid = require("gridfs-stream");
const { GridFsStorage } = require("multer-gridfs-storage");
const router = express.Router();
const { MongoClient, GridFSBucket } = require("mongodb");
let gfsBucket;

const conn = mongoose.createConnection(process.env.MONGO_URI);
conn.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

conn.once("open", () => {
  //   gfs = Grid(conn.db, mongoose.mongo);
  //   gfs.collection("uploads");
  gfsBucket = new GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
  console.log('GridFS Storage connected');
});
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  file: (req, file) => {
    console.log("File being processed:", file);
    return {
      filename: file.originalname,
      bucketName: "uploads",
    };
  },
});
storage.on("connection", (db) => {
  console.log("GridFS Storage connected");
});
storage.on("error", (err) => {
  console.error("GridFS Storage error:", err);
});


const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.file , "req.file");
    if (!req.file) {
      return res.status(400).json({ msg: "No file uploaded" });
    }
    const { description } = req.body;
    const newImage = new Image({
      filename: req.file.filename,
      description,
    });
    await newImage.save();
    res.status(201).json({ file: req.file, description });
  } catch (error) {
    res.status(500).json({
      msg: "Failed",
      error,
    });
  }
});

module.exports = router;
