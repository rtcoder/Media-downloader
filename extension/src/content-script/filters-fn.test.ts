import {describe, expect, it} from 'vitest';
import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {
  getMediaTypeFromContentType,
  getMediaTypeFromUrl,
  isIgnoredLinkedAsset,
} from './filters-fn';

describe('linked media classification', () => {
  it('detects direct media URLs by extension', () => {
    expect(getMediaTypeFromUrl('https://cdn.example.com/photo.webp?size=large')).toBe(ItemTypeEnum.IMAGE);
    expect(getMediaTypeFromUrl('https://cdn.example.com/movie.mp4?token=abc')).toBe(ItemTypeEnum.VIDEO);
    expect(getMediaTypeFromUrl('https://cdn.example.com/audio.m4a')).toBe(ItemTypeEnum.AUDIO);
  });

  it('detects media responses by content type', () => {
    expect(getMediaTypeFromContentType('image/jpeg; charset=binary')).toBe(ItemTypeEnum.IMAGE);
    expect(getMediaTypeFromContentType('video/mp4')).toBe(ItemTypeEnum.VIDEO);
    expect(getMediaTypeFromContentType('audio/mpeg')).toBe(ItemTypeEnum.AUDIO);
    expect(getMediaTypeFromContentType('text/html; charset=utf-8')).toBeNull();
  });

  it('ignores common non-download assets', () => {
    expect(isIgnoredLinkedAsset('https://example.com/favicon.ico', 'image/x-icon')).toBe(true);
    expect(isIgnoredLinkedAsset('https://example.com/icon.svg', 'image/svg+xml')).toBe(false);
    expect(isIgnoredLinkedAsset('javascript:void(0)')).toBe(true);
    expect(isIgnoredLinkedAsset('mailto:test@example.com')).toBe(true);
    expect(isIgnoredLinkedAsset('#preview')).toBe(true);
  });
});
