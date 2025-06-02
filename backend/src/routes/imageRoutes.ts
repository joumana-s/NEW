import express from 'express';
import multer from 'multer';
import path from 'path';
import { resizeImage } from '../utils/imageProcessor';
import fs from 'fs';

const router = express.Router();

const imagesFolder = path.resolve(__dirname, '../../images');
const uploadsFolder = path.resolve(__dirname, '../../uploads');

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
  if (!fs.existsSync(originalImagePath)) {
    res.status(404).send('Original image does not exist');
    return;
  }

  // Construct resized image path
  const resizedImageName = `${path.parse(filename).name}_${width}x${height}${path.extname(filename)}`;
  const resizedImagePath = path.join(imagesFolder, resizedImageName);

  // If resized image already exists, serve it
  if (fs.existsSync(resizedImagePath)) {
    res.sendFile(resizedImagePath);
    return;
  }

  try {
    // Resize and save image
    await resizeImage(originalImagePath, resizedImagePath, width, height);
    res.sendFile(resizedImagePath);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to process image');
  }
});

// POST /api/images/upload
router.post('/upload', upload.single('image'), (req, res): void => {
  if (!req.file) {
    res.status(400).send('No file uploaded or invalid file type.');
    return;
  }

  // Move the uploaded file to images folder (overwrite if exists)
  const oldPath = path.join(uploadsFolder, req.file.filename);
  const newPath = path.join(imagesFolder, req.file.filename);

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error saving the uploaded image');
      return;
    }
    res.status(200).send('Image uploaded successfully');
  });
});

export default router;
