import express from 'express';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';

const app = express();
const port = 3000;

// Configure multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'image/jpeg') {
      return cb(new Error('Only .jpg files are allowed'));
    }
    cb(null, true);
  }
});

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../../frontend')));

// Serve uploaded images
app.use('/images', express.static(path.join(__dirname, '../images')));

// Handle image upload
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ message: 'File uploaded successfully' });
});

// Handle image resize
app.get('/resize', async (req, res) => {
  const { filename, width, height } = req.query;
  
  if (!filename || !width || !height) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const imagePath = path.join(__dirname, '../images', filename as string);
  
  try {
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const resizedImage = await sharp(imagePath)
      .resize(Number(width), Number(height))
      .toBuffer();

    res.set('Content-Type', 'image/jpeg');
    res.send(resizedImage);
  } catch (error) {
    res.status(500).json({ error: 'Error processing image' });
  }
});

export default app;
