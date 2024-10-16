require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const imageRoutes = require("./routes/imageRoutes");
const app = express();
const path = require("path");
const multerErrorHandler = require('./middleware/multerErrorHandler');
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


mongoose
.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDb connected"))
.catch((err) => console.log(err));

app.use("/images", imageRoutes);


app.use(multerErrorHandler)

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
