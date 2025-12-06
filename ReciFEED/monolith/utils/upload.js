const multer = require('multer');

// Configure multer for memory storage (files will be in memory as buffers)
const storage = multer.memoryStorage();

// File filter to accept only image files
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, and WebP are allowed.`), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// Utility function to convert uploaded files to base64
const convertFilesToBase64 = (files) => {
  if (!files || files.length === 0) {
    return [];
  }

  return files.map(file => {
    const base64String = file.buffer.toString('base64');
    // Return data URL format for direct use in frontend
    return `data:${file.mimetype};base64,${base64String}`;
  });
};

module.exports = {
  upload,
  convertFilesToBase64
};
