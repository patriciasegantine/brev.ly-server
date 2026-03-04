import { app } from '@/app';
import {expect} from "vitest";

describe('Health check', () => {
  it('should return status ok', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });
    
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
      message: 'Server is running',
    });
  });
});
