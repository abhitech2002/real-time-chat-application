const cloudinary = require('../config/cloudinary');

// @desc    Upload file to Cloudinary
// @route   POST /api/upload
// @access  Private
exports.uploadFile = async (req, res) => {
  try {
    console.log('📤 Upload request received');
    
    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('📁 File received:', req.file.originalname, req.file.mimetype);

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      console.log('❌ Cloudinary not configured');
      return res.status(500).json({
        success: false,
        message: 'File upload service not configured. Please set Cloudinary credentials.'
      });
    }

    // Determine resource type based on file mimetype
    const resourceType = req.file.mimetype.startsWith('image/') ? 'image' : 'raw';

    console.log('☁️ Uploading to Cloudinary as:', resourceType);

    // Upload to Cloudinary using buffer
    cloudinary.uploader.upload_stream(
      {
        folder: 'chat-app',
        resource_type: resourceType
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload file',
            error: error.message
          });
        }

        console.log('✅ Upload successful:', result.secure_url);

        res.status(200).json({
          success: true,
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type,
            format: result.format,
            size: result.bytes
          }
        });
      }
    ).end(req.file.buffer);

  } catch (error) {
    console.error('❌ Upload controller error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};