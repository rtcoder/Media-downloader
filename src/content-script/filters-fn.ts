import {NullableString} from '../types/common.type';
import {MediaItem} from '../types/media-in-tabs.type';
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
  return url.startsWith('data:image') || imageRegex.test(url);
}

export function isVideoURL(url: string) {
  return url.startsWith('data:video') || videoRegex.test(url);
}

export function isAudioURL(url: string) {
  return url.startsWith('data:audio') || audioRegex.test(url);
}

export function removeDuplicateOrEmpty(data: MediaItem[]): MediaItem[] {

  let result = [...new Map(data.map((item) => [item.src, item])).values()];

  result = result.filter(({src}: { src: string }) => !!src);

  return result;
}
