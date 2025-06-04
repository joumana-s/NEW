import express from 'express';
import multer from 'multer';
import path from 'path';
import { resizeImage } from '../utils/imageProcessor';
import fs from 'fs';

const router = express.Router();

// Use process.cwd() to maintain consistent paths
const imagesFolder = path.join(process.cwd(), 'images');
const uploadsFolder = path.join(process.cwd(), 'uploads');

// Ensure directories exist
[imagesFolder, uploadsFolder].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Multer setup for uploading only jpg files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(new Error('Only JPG files are allowed!'));
  }
};

const upload = multer({ storage, fileFilter });

// GET /api/images?filename=xxx&width=xxx&height=xxx
router.get('/', async (req, res): Promise<void> => {
  try {
    const filename = req.query.filename as string;
    const width = parseInt(req.query.width as string);
    const height = parseInt(req.query.height as string);

    // Validate inputs
    if (!filename || !width || !height || width <= 0 || height <= 0) {
      res.status(400).send('Missing or invalid filename, width, or height');
      return;
    }

    // Check if original image exists
    const originalImagePath = path.join(imagesFolder, filename);
    console.log('Looking for original image at:', originalImagePath);
    if (!fs.existsSync(originalImagePath)) {
      console.log('Original image not found');
      res.status(404).send('Original image does not exist');
      return;
    }
    console.log('Original image found');

    // Construct resized image path
    const resizedImageName = `${path.parse(filename).name}_${width}x${height}${path.extname(filename)}`;
    const resizedImagePath = path.join(imagesFolder, resizedImageName);
    console.log('Will create resized image at:', resizedImagePath);

    // If resized image already exists, serve it
    if (fs.existsSync(resizedImagePath)) {
      console.log('Resized image already exists, serving it');
      res.sendFile(resizedImagePath);
      return;
    }
    console.log('Resized image does not exist, creating it now');

    // Resize and save image
    await resizeImage(originalImagePath, resizedImagePath, width, height);
    console.log('Image resized successfully');
    res.sendFile(resizedImagePath);
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Failed to process image');
  }
});

// POST /api/images/upload
router.post('/upload', upload.single('image'), async (req, res): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).send('No file uploaded or invalid file type.');
      return;
    }

    // Move the uploaded file to images folder (overwrite if exists)
    const oldPath = path.join(uploadsFolder, req.file.filename);
    const newPath = path.join(imagesFolder, req.file.filename);

    await fs.promises.rename(oldPath, newPath);
    res.status(200).send('Image uploaded successfully');
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Error saving the uploaded image');
  }
});

export default router;
