// middleware/upload.js
const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;


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