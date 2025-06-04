import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import imageRoutes from './routes/imageRoutes';

const app = express();

// Get the correct paths using current working directory
const frontendPath = path.join(process.cwd(), 'frontend');
const imagesPath = path.join(process.cwd(), 'images');

// Debug file existence
console.log('Current working directory:', process.cwd());
console.log('Frontend path exists:', fs.existsSync(frontendPath));
console.log('Images path exists:', fs.existsSync(imagesPath));

// Log paths for debugging
console.log('Frontend path:', frontendPath);
console.log('Images path:', imagesPath);

// List frontend directory contents
try {
  console.log('Frontend directory contents:', fs.readdirSync(frontendPath));
} catch (err) {
  console.error('Error reading frontend directory:', err);
}

// Serve frontend static files
app.use(express.static(frontendPath));
app.use('/images', express.static(imagesPath));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/images', imageRoutes);

// Root route serving the frontend index.html file
app.get('/', (req: Request, res: Response): void => {
  const indexPath = path.join(frontendPath, 'index.html');
  console.log('Trying to serve index.html from:', indexPath);
  console.log('index.html exists:', fs.existsSync(indexPath));
  
  if (!fs.existsSync(indexPath)) {
    console.error('index.html not found at:', indexPath);
    res.status(404).send('Frontend files not found');
    return;
  }
  res.sendFile(indexPath);
});

// 404 handler for unmatched routes
app.use((req: Request, res: Response): void => {
  res.status(404).send('Route not found');
});

export default app;
