import {NullableChromeTab} from './chrome.type';
import {MediaItem, QuickMediaItem} from './media-in-tabs.type';

export type FoundMedia = {
  error: any;
  image: MediaItem[];
  audio: MediaItem[];
  video: MediaItem[];
  tabInfo: NullableChromeTab;
}

export type FoundMediaQuick = {
  error: any;
  media: QuickMediaItem[];
}
