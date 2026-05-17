import {MediaItem, QuickMediaItem} from '../types/media-in-tabs.type';
import {downloadUrl} from './chrome-api';

export function downloadSelectedImages(items: MediaItem[]) {
  items.filter(item => item.selected)
    .forEach(item => downloadUrl(item.src));
}

export function downloadImages(items: QuickMediaItem[]) {
  items.forEach(item => downloadUrl(item.src));
}
