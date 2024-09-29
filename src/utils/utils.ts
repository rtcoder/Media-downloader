import {MediaInfo, MediaToDisplayItem} from '../types/media-display.type';
import {MixedObject} from '../types/mixed-object.type';
import {q} from './dom-functions';

function getGridItemSelector(index: string): string {
  return `.grid-item[data-item-idx="${index}"]`;
}

export function getNameFromUrl(url: string): string {
  return url.split('/').pop() || '';
}

export function uniqueSourceItems(arr: any[]) {
  return [...new Map(arr.map(item => [item.src, item])).values()];
}

export function countAllMedia(mediaToDisplay: MediaToDisplayItem[]) {
  return mediaToDisplay.reduce((total, mediaGroup) => {
    return total + mediaGroup.items.length;
  }, 0);
}

export function _dispatchEvent(el: any, name: string, detail: MixedObject, bubbles = true, composed = true) {
  el.dispatchEvent(new CustomEvent(name, {detail, bubbles, composed}));
}

export function mapMediaTypeToSectionName(type: string): keyof MediaInfo {
  if (type === 'image') {
    return 'images';
  }
  if (type === 'video') {
    return 'videos';
  }
  return 'audios';
}

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

export function getTabUuid(tab: chrome.tabs.Tab) {
// return getCrc32Hash();
}

export function getCurrentSection() {
  return q(`.section-buttons button.selected`)!
    .getAttribute('data-section') || 'images';
}
