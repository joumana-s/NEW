import request from 'supertest';
import express from 'express';
import path from 'path';
import fs from 'fs';
import imageRoutes from '../src/routes/imageRoutes';

jest.mock('../src/utils/imageProcessor', () => ({
  resizeImage: jest.fn().mockResolvedValue(undefined),
}));
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/images', imageRoutes);

const imagesFolder = path.resolve(__dirname, '../../../images');
const testImagePath = path.join(imagesFolder, 'test.jpg');

// Mock resizeImage util
jest.mock('../../utils/imageProcessor', () => ({
  resizeImage: jest.fn().mockResolvedValue(undefined),
}));

describe('Image Routes', () => {
  beforeAll(() => {
    // Ensure test image exists
    if (!fs.existsSync(imagesFolder)) fs.mkdirSync(imagesFolder, { recursive: true });
    fs.writeFileSync(testImagePath, Buffer.alloc(10)); // Create dummy file
  });

  afterAll(() => {
    if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
  });

  describe('GET /api/images', () => {
    it('should return 400 for missing parameters', async () => {
      const res = await request(app).get('/api/images');
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent image', async () => {
      const res = await request(app)
        .get('/api/images')
        .query({ filename: 'notfound.jpg', width: 100, height: 100 });
      expect(res.status).toBe(404);
    });

    it('should return 200 for valid resize request', async () => {
      const res = await request(app)
        .get('/api/images')
        .query({ filename: 'test.jpg', width: 100, height: 100 });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/images/upload', () => {
    it('should return 400 for missing file', async () => {
      const res = await request(app).post('/api/images/upload');
      expect(res.status).toBe(400);
    });

    it('should return 200 for valid upload', async () => {
      const res = await request(app)
        .post('/api/images/upload')
        .attach('image', testImagePath);
      expect(res.status).toBe(200);
    });
  });
});
