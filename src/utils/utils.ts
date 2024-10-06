import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {getCrc32Hash} from './crc32';
import {q} from './dom-functions';

export function formatTime(seconds: number): string {
  const sec = Math.floor(seconds % 60); // Sekundy
  const min = Math.floor((seconds % 3600) / 60); // Minuty
  const hrs = Math.floor(seconds / 3600); // Godziny

  const secStr = sec < 10 ? `0${sec}` : sec; // Dodaj zero przed sekundami, jeśli mniej niż 10
  const minStr = min < 10 ? `0${min}` : min; // Dodaj zero przed minutami, jeśli mniej niż 10

  if (hrs > 0) {
    return `${hrs}:${minStr}:${secStr}`; // Format hh:mm:ss
  } else {
    return `${minStr}:${secStr}`; // Format mm:ss
  }
}

export function getQualityLabel(width: number) {
  if (width >= 3840) return '4K';
  if (width >= 2560) return '1440p';
  if (width >= 1920) return '1080p';
  if (width >= 1280) return '720p';
  if (width >= 854) return '480p';
  if (width >= 640) return '360p';
  return 'SD';
}

export function getUuid(val: string | number) {
  return getCrc32Hash(val.toString());
}

export function getCurrentSection(): ItemTypeEnum {
  const key = q(`.section-buttons button.selected`)!.getAttribute('data-section') as ItemTypeEnum;
  return key || ItemTypeEnum.IMAGE;
}
