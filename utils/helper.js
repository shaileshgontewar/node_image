const fs = require("fs").promises;
const path = require("path");

if (imageUrl) {
  const imagePath = path.join(__dirname, "../uploads", path.basename(imageUrl));
  try {
    await fs.unlink(imagePath);
  } catch (err) {
    console.error("Failed to delete image file:", err);
  }
}
