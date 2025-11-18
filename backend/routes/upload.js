const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadFile } = require('../controllers/uploadController');

// Upload file route
router.post('/', protect, upload.single('file'), uploadFile);

module.exports = router;