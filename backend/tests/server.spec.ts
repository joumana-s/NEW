/// <reference types="jasmine" />

import request from 'supertest';
import app from '../src/app';

describe('Server Endpoints', () => {
  it('should serve frontend index.html', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<!DOCTYPE html');
  });

  it('should return 404 on unknown route', async () => {
    const res = await request(app).get('/unknownroute');
    expect(res.status).toBe(404);
  });

  it('should handle /api/images with bad params', async () => {
    const res = await request(app).get('/api/images');
    expect(res.status).toBe(400);
  });
});

