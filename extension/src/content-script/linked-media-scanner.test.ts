import {describe, expect, it, vi} from 'vitest';
import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {
  collectLinkedMediaCandidates,
  extractMediaFromLinkedHtml,
  findLinkedMedia,
  normalizeLinkedUrl,
  probeLinkedMedia,
} from './linked-media-scanner';

describe('linked media scanner', () => {
  it('normalizes relative links and ignores unsupported schemes', () => {
    expect(normalizeLinkedUrl('/files/photo.jpg', 'https://example.com/gallery/page.html')).toBe('https://example.com/files/photo.jpg');
    expect(normalizeLinkedUrl('files/video.mp4', 'https://example.com/gallery/page.html')).toBe('https://example.com/gallery/files/video.mp4');
    expect(normalizeLinkedUrl('mailto:test@example.com', 'https://example.com')).toBeNull();
    expect(normalizeLinkedUrl('javascript:void(0)', 'https://example.com')).toBeNull();
  });

  it('collects direct media anchors and removes duplicates', () => {
    const doc = document.implementation.createHTMLDocument('test');
    doc.body.innerHTML = `
      <a href="/downloads/photo.jpg">Photo</a>
      <a href="/downloads/photo.jpg">Duplicate</a>
      <a href="/downloads/movie.mp4">Movie</a>
      <a href="/page.html">HTML</a>
    `;

    const results = collectLinkedMediaCandidates(doc, 'https://example.com/gallery/');

    expect(results).toEqual([
      {
        src: 'https://example.com/downloads/photo.jpg',
        type: ItemTypeEnum.IMAGE,
        poster: null,
        sourceKind: 'linked',
        sourceUrl: 'https://example.com/gallery/',
        label: 'Photo',
      },
      {
        src: 'https://example.com/downloads/movie.mp4',
        type: ItemTypeEnum.VIDEO,
        poster: null,
        sourceKind: 'linked',
        sourceUrl: 'https://example.com/gallery/',
        label: 'Movie',
      },
    ]);
  });

  it('detects ambiguous links by response content type', async () => {
    const fetchFn = vi.fn(async () => new Response('', {
      status: 200,
      headers: {'Content-Type': 'video/mp4'},
    }));

    const result = await probeLinkedMedia('https://files.example.com/download?id=123', 'https://example.com/page', fetchFn);

    expect(result).toEqual({
      src: 'https://files.example.com/download?id=123',
      type: ItemTypeEnum.VIDEO,
      poster: null,
      sourceKind: 'linked',
      sourceUrl: 'https://example.com/page',
    });
  });

  it('falls back to ranged GET when HEAD has no useful type', async () => {
    const calls: string[] = [];
    const fetchFn = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      calls.push(init?.method || 'GET');
      if (init?.method === 'HEAD') {
        return new Response('', {status: 200});
      }
      return new Response('', {
        status: 206,
        headers: {'Content-Type': 'audio/mpeg'},
      });
    });

    const result = await probeLinkedMedia('https://files.example.com/download?id=456', 'https://example.com/page', fetchFn);

    expect(calls).toEqual(['HEAD', 'GET']);
    expect(result?.type).toBe(ItemTypeEnum.AUDIO);
  });

  it('extracts media from linked HTML metadata and media tags', () => {
    const results = extractMediaFromLinkedHtml(`
      <html>
        <head>
          <meta property="og:image" content="/preview.jpg">
          <meta property="og:video" content="https://cdn.example.com/trailer.mp4">
        </head>
        <body>
          <video poster="/poster.webp"><source src="/movie.webm"></video>
          <audio><source src="/clip.m4a"></audio>
        </body>
      </html>
    `, 'https://example.com/posts/1');

    expect(results).toEqual([
      {
        src: 'https://example.com/preview.jpg',
        type: ItemTypeEnum.IMAGE,
        poster: null,
        sourceKind: 'linked',
        sourceUrl: 'https://example.com/posts/1',
        label: 'og:image',
      },
      {
        src: 'https://cdn.example.com/trailer.mp4',
        type: ItemTypeEnum.VIDEO,
        poster: null,
        sourceKind: 'linked',
        sourceUrl: 'https://example.com/posts/1',
        label: 'og:video',
      },
      {
        src: 'https://example.com/movie.webm',
        type: ItemTypeEnum.VIDEO,
        poster: 'https://example.com/poster.webp',
        sourceKind: 'linked',
        sourceUrl: 'https://example.com/posts/1',
        label: 'video source',
      },
      {
        src: 'https://example.com/clip.m4a',
        type: ItemTypeEnum.AUDIO,
        poster: null,
        sourceKind: 'linked',
        sourceUrl: 'https://example.com/posts/1',
        label: 'audio source',
      },
    ]);
  });

  it('combines direct and probed linked media', async () => {
    const doc = document.implementation.createHTMLDocument('test');
    doc.body.innerHTML = `
      <a href="/photo.jpg">Photo</a>
      <a href="/download?id=1">Download</a>
    `;
    const fetchFn = vi.fn(async () => new Response('', {
      status: 200,
      headers: {'Content-Type': 'image/png'},
    }));

    const results = await findLinkedMedia(doc, 'https://example.com/page', fetchFn);

    expect(results.map(item => item.src)).toEqual([
      'https://example.com/photo.jpg',
      'https://example.com/download?id=1',
    ]);
  });
});
