/// <reference types="jasmine" />

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { resizeImage } from '../src/utils/imageProcessor'; // adjust path

describe('Image Processing - resizeImage', () => {
  const inputPath = path.join(__dirname, 'test-assets', 'input.jpg');
  const outputPath = path.join(__dirname, 'test-assets', 'output.jpg');
  const width = 100;
  const height = 100;

  beforeAll(async () => {
    // Ensure test-assets folder exists
    fs.mkdirSync(path.dirname(inputPath), { recursive: true });

    // Create a dummy input image (200x200 px)
    await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .jpeg()
    .toFile(inputPath);
  });

  afterAll(() => {
    // Clean up test files
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  });

  it('should resize the image to the specified dimensions', async () => {
    await resizeImage(inputPath, outputPath, width, height);

    expect(fs.existsSync(outputPath)).toBe(true);

    const metadata = await sharp(outputPath).metadata();
    expect(metadata.width).toBe(width);
    expect(metadata.height).toBe(height);
  });
});
