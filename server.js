require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const imageRoutes = require("./routes/imageRoutes");
const app = express();
const path = require("path");
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Mongo db connected"))
  .catch((err) => console.log(err));

app.use("/images", imageRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
