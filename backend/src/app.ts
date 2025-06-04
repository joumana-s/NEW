import express from 'express';
import path from 'path';
import cors from 'cors';
import imageRoutes from './routes/imageRoutes';

// Create Express app
export const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend and images directories
const frontendPath = path.join(process.cwd(), 'frontend');
const imagesPath = path.join(process.cwd(), 'images');
app.use(express.static(frontendPath));
app.use('/images', express.static(imagesPath));

// API routes
app.use('/api/images', imageRoutes);

// Only start the server if this file is run directly
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;
