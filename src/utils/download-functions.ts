import {MediaToDisplayItem} from '../types/media-display.type';
import {downloadUrl} from './chrome-api';

export function downloadItem(itemInfo: { url: string; alt: string | null }) {
  downloadUrl(itemInfo.url, itemInfo.alt);
}

export function downloadImages(mediaToDisplay: MediaToDisplayItem[]) {
  const checkedImages = [];

  for (let i = 0; i < mediaToDisplay.length; i++) {
    const {items} = mediaToDisplay[i];
    for (let idx = 0; idx < items.length; idx++) {
      if (items[idx].selected) {
        checkedImages.push({
          url: items[idx].src,
          alt: items[idx].alt,
        });
      }
    }
  }
  checkedImages.forEach(downloadItem);
}
