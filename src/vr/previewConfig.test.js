import { describe, expect, it } from 'vitest';
import { localApiProxy } from '../../vite.config.js';

describe('local preview proxy', () => {
  it('forwards API and health through the localhost-only server boundary', () => {
    expect(Object.keys(localApiProxy)).toEqual(['/api', '/health']);
    for (const route of Object.values(localApiProxy)) {
      expect(route.target).toBe('http://localhost:8787');
      expect(route.changeOrigin).toBe(true);
      expect(route.headers).toEqual({ Origin: 'http://localhost:5173' });
    }
  });
});
