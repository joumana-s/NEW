import express from 'express';
import path from 'path';
import imageRoutes from './routes/imageRoutes';

const app = express();

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../../frontend')));
app.use('/images', express.static(path.join(__dirname, '../images')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/images', imageRoutes);

// Export the app for testing
export default app;
