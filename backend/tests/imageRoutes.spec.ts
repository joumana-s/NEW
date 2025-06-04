/// <reference types="jasmine" />

import request from 'supertest';
import { app } from '../src/app';
import { setup, cleanup } from './helpers/testSetup';
import path from 'path';
import fs from 'fs';
import * as imageProcessor from '../src/utils/imageProcessor';

const imagesFolder = path.join(process.cwd(), 'images');
const uploadsFolder = path.join(process.cwd(), 'uploads');
const testImagePath = path.join(imagesFolder, 'test.jpg');

describe('Image Routes', () => {
  beforeAll(async () => {
    setup();
    if (!fs.existsSync(imagesFolder)) fs.mkdirSync(imagesFolder, { recursive: true });
    fs.writeFileSync(testImagePath, Buffer.alloc(10)); // Create dummy file

    // Update the spy to actually create the resized file
    spyOn(imageProcessor, 'resizeImage').and.callFake(async (inputPath: string, outputPath: string) => {
      // Copy the test file to the output path to simulate resizing
      fs.copyFileSync(inputPath, outputPath);
      return Promise.resolve();
    });
  });

  afterAll(async () => {
    // Wait a bit to ensure all file operations are complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    cleanup();
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
      // First, ensure the original image exists
      const originalImagePath = path.join(imagesFolder, 'test.jpg');
      expect(fs.existsSync(originalImagePath)).toBe(true);

      const response = await request(app)
        .get('/api/images')
        .query({
          filename: 'test.jpg',
          width: '100',
          height: '100'
        });

      // Log the response for debugging
      console.log('Response status:', response.status);
      console.log('Response body:', response.body);
      console.log('Response headers:', response.headers);

      expect(response.status).toBe(200);

      // Check if the resized image was created
      const resizedImagePath = path.join(imagesFolder, 'test_100x100.jpg');
      expect(fs.existsSync(resizedImagePath)).toBe(true);
    });

    it('should return 400 for invalid dimensions', async () => {
      const response = await request(app)
        .get('/api/images')
        .query({
          filename: 'test.jpg',
          width: '-100',
          height: '100'
        });
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/images/upload', () => {
    it('should return 400 for missing file', async () => {
      const response = await request(app)
        .post('/api/images/upload');
      expect(response.status).toBe(400);
    });

    it('should return 200 for valid upload', async () => {
      const testImagePath = path.join(uploadsFolder, 'test.jpg');
      const response = await request(app)
        .post('/api/images/upload')
        .attach('image', testImagePath);
      expect(response.status).toBe(200);
    });
  });
});
