import {NullableString} from '../types/common.type';
import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {audioRegex, imageRegex, videoRegex} from './regex-pattern';

export function isNotYouTubeLink({src}: { src: string }) {
  return !src.includes('https://www.youtube.com')
    && !src.includes('https://www.youtu.be')
    && !src.includes('https://youtube.com')
    && !src.includes('https://youtu.be');
}

export function isNotEmpty({src}: { src: NullableString }) {
  return !!src;
}

export function isImageURL(url: string) {
  return url.length && url.startsWith('data:image') || imageRegex.test(url);
}

export function isVideoURL(url: string) {
  return url.length && url.startsWith('data:video') || videoRegex.test(url);
}

export function isAudioURL(url: string) {
  return url.length && url.startsWith('data:audio') || audioRegex.test(url);
}

export function getMediaTypeFromUrl(url: string): ItemTypeEnum | null {
  if (isImageURL(url)) {
    return ItemTypeEnum.IMAGE;
  }
  if (isVideoURL(url)) {
    return ItemTypeEnum.VIDEO;
  }
  if (isAudioURL(url)) {
    return ItemTypeEnum.AUDIO;
  }
  return null;
}

export function getMediaTypeFromContentType(contentType: string | null): ItemTypeEnum | null {
  const normalized = (contentType || '').toLowerCase().split(';')[0].trim();
  if (!normalized) {
    return null;
  }
  if (normalized.startsWith('image/') && normalized !== 'image/x-icon') {
    return ItemTypeEnum.IMAGE;
  }
  if (normalized.startsWith('video/')) {
    return ItemTypeEnum.VIDEO;
  }
  if (normalized.startsWith('audio/')) {
    return ItemTypeEnum.AUDIO;
  }
  return null;
}

export function isIgnoredLinkedAsset(url: string, contentType: string | null = null): boolean {
  const normalizedUrl = url.trim().toLowerCase();
  const normalizedContentType = (contentType || '').toLowerCase().split(';')[0].trim();

  return !normalizedUrl
    || normalizedUrl.startsWith('javascript:')
    || normalizedUrl.startsWith('mailto:')
    || normalizedUrl.startsWith('tel:')
    || normalizedUrl.startsWith('#')
    || normalizedUrl.endsWith('/favicon.ico')
    || normalizedContentType === 'image/x-icon';
}

export function removeDuplicateOrEmpty<T extends { src: string }>(data: T[]): T[] {
  let result = [...new Map(data.map((item) => [item.src, item])).values()];

  result = result.filter(({src}: { src: string }) => !!src);

  return result;
}
