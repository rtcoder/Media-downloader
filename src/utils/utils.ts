import {MediaInfo, MediaToDisplayItem} from '../types/media-display.type';
import {MixedObject} from '../types/mixed-object.type';
import {q} from './dom-functions';

/**
 * Generates a CSS selector string for an image thumbnail based on the provided index.
 *
 * This function returns a CSS selector string that targets an image thumbnail
 * with a specific `data-item-index` attribute.
 *
 * @param {number|string} index - The index of the item used in the `data-item-index` attribute.
 * @returns {string} The generated CSS selector string for the image thumbnail.
 */
function getImageSelector(index: string): string {
  return `grid-item[item-index="${index}"]`;
}

/**
 * Extracts and returns the file name from a given URL.
 *
 * This function splits the URL by slashes and returns the last part,
 * which typically represents the file name or resource name.
 *
 * @param {string} url - The URL string from which to extract the file name.
 * @returns {string} The extracted file name from the URL.
 */
export function getNameFromUrl(url: string): string {
  return url.split('/').pop() || '';
}

/**
 * Returns an array of unique items based on the `src` property.
 *
 * This function takes an array of objects, maps them to a Map using the `src` property as the key,
 * and then returns an array of the values from the Map, ensuring that only unique items based on `src` are included.
 *
 * @param {Array<{src: string, [key: string]: any}>} arr - The array of objects to filter for unique `src` values.
 * @returns {Array<{src: string, [key: string]: any}>} A new array containing only unique items based on `src`.
 */
export function uniqueSourceItems(arr: any[]) {
  return [...new Map(arr.map(item => [item.src, item])).values()];
}

/**
 * Calculates the total number of media items across all tabs.
 *
 * @param {MediaToDisplayItem[]} mediaToDisplay - The array of media items to display.
 * @returns {number} The total count of all media items.
 */
export function countAllMedia(mediaToDisplay: MediaToDisplayItem[]) {
  return mediaToDisplay.reduce((total, mediaGroup) => {
    return total + mediaGroup.items.length;
  }, 0);
}

export function getVideoDimensions(url: string) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.onloadedmetadata = () => {
      resolve({width: video.videoWidth, height: video.videoHeight, duration: video.duration});
    };
    video.onerror = reject;
    video.src = url;
  });
}

export function kebabToCamel(kebabCaseString: string): string {
  return kebabCaseString.toLowerCase().replace(/-([a-z])/g, (match, letter) => {
    return letter.toUpperCase();
  });
}

export function _dispatchEvent(el: any, name: string, detail: MixedObject, bubbles = true, composed = true) {
  el.dispatchEvent(new CustomEvent(name, {detail, bubbles, composed}));
}

export function mapToString(array: any[], callback: any, separator = '') {
  return array.map(callback).join(separator);
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
