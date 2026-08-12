import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('Grimoire XR installable phone shell', () => {
  it('publishes a standalone VR-first manifest and provider-free shortcut', () => {
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
    expect(manifest.start_url).toContain('/vr');
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.some(icon => icon.sizes === '192x192')).toBe(true);
    expect(manifest.icons.some(icon => icon.sizes === '512x512' && icon.purpose.includes('maskable'))).toBe(true);
    expect(manifest.shortcuts.some(shortcut => shortcut.url.includes('demo=1'))).toBe(true);
  });

  it('caches the app shell while explicitly bypassing live provider routes', () => {
    const worker = readFileSync('public/service-worker.js', 'utf8');
    expect(worker).toContain("caches.match('/index.html')");
    expect(worker).toContain("url.pathname.startsWith('/api/')");
    expect(worker).toContain("url.pathname.startsWith('/comfyui/')");
    expect(worker).toContain("url.pathname.startsWith('/ollama/')");
  });
});
