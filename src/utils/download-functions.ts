import {MediaToDisplay} from '../types/media-display.type';
import {downloadUrl} from './chrome-api';

export function downloadItem(itemInfo: { url: string; alt: string | null }) {
  downloadUrl(itemInfo.url, itemInfo.alt);
}

export function downloadImages(mediaToDisplay: MediaToDisplay[]) {
  const checkedImages = [];

  for (let i = 0; i < mediaToDisplay.length; i++) {
    const {data} = mediaToDisplay[i];

    for (let idx = 0; idx < data.length; idx++) {
      const {items} = data[idx];

      for (let _idx = 0; _idx < items.length; _idx++) {
        if (items[_idx].selected) {
          checkedImages.push({
            url: items[_idx].src,
            alt: items[_idx].alt,
          });
        }
      }
    }
  }
  checkedImages.forEach(downloadItem);
}
