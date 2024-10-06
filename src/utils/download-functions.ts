import {NullableString} from '../types/common.type';
import {MediaItem} from '../types/media-in-tabs.type';
import {downloadUrl} from './chrome-api';

export function downloadItem(itemInfo: { url: string; alt: NullableString }) {
  downloadUrl(itemInfo.url, itemInfo.alt);
}

export function downloadImages(items: MediaItem[]) {
  const checkedImages = [];

  for (let _idx = 0; _idx < items.length; _idx++) {
    if (items[_idx].selected) {
      checkedImages.push({
        url: items[_idx].src,
        alt: items[_idx].alt,
      });
    }
  }
  checkedImages.forEach(downloadItem);
}
