import express from 'express';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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
    // Ensure unique filenames by adding timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'image/jpeg') {
      cb(new Error('Only .jpg files are allowed'));
      return;
    }
    cb(null, true);
  }
});

// Ensure sample images exist
const ensureSampleImages = async () => {
  const imagesDir = path.join(__dirname, '../images');
  const sampleImages = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
  
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Create sample images if they don't exist
  for (const imageName of sampleImages) {
    const imagePath = path.join(imagesDir, imageName);
    if (!fs.existsSync(imagePath)) {
      try {
        await sharp({
          create: {
            width: 100,
            height: 100,
            channels: 3,
            background: { r: 0, g: 0, b: 0 }
          }
        })
        .jpeg()
        .toFile(imagePath);
        console.log(`Created sample image: ${imageName}`);
      } catch (error) {
        console.error(`Failed to create sample image ${imageName}:`, error);
      }
    }
  }
};

// Create sample images on startup
ensureSampleImages().catch(console.error);

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Parse JSON bodies
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '../../frontend')));

// Serve uploaded images
app.use('/images', express.static(path.join(__dirname, '../images')));

// Create API router
const apiRouter = express.Router();

// List all images
apiRouter.get('/list', (req, res) => {
  const imagesDir = path.join(__dirname, '../images');
  try {
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    const files = fs.readdirSync(imagesDir)
      .filter(file => file.toLowerCase().endsWith('.jpg'));
    res.json(files);
  } catch (error) {
    console.error('Error reading images directory:', error);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

// Handle image upload
apiRouter.post('/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ 
      message: 'File uploaded successfully',
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Handle image resize
apiRouter.get('/resize', async (req, res) => {
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
  } catch (err) {
    console.error('Error processing image:', err);
    res.status(500).json({ error: 'Error processing image' });
  }
});

// Mount API routes under /api/images
app.use('/api/images', apiRouter);

export default app;
