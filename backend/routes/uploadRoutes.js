import express from 'express';
import { upload } from '../config/cloudinary.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Upload single image
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      url: req.file.secure_url || req.file.path,
      public_id: req.file.public_id,
      width: req.file.width,
      height: req.file.height,
      format: req.file.format,
      resource_type: req.file.resource_type
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message
    });
  }
});

// Upload multiple images
router.post('/images', auth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const urls = req.files.map(file => file.secure_url || file.path);
    
    const uploadedFiles = req.files.map(file => ({
      url: file.secure_url || file.path,
      public_id: file.public_id,
      width: file.width,
      height: file.height,
      format: file.format,
      resource_type: file.resource_type,
      bytes: file.bytes
    }));

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      urls: urls,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
});

export default router;





