const multer = require("multer"); // package to extract incoming files, can't be done by body-parser

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/gif": "gif",
};

// Store incoming files on the local system
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }

    // return the file save folder path, relative to server.js
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    // Replace empty spaces with a hyphen
    const name = file.originalname.toLowerCase().split(" ").join("-");
    const extension = MIME_TYPE_MAP[file.mimetype];
    // return the filename, 1st argument is null for no error
    cb(null, `${name}-${Date.now()}.${extension}`);
  },
});

module.exports = multer({ storage: storage }).single("image");
