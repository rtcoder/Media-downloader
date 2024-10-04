import {NullableChromeTab} from './chrome.type';
import {MediaItem} from './media-in-tabs.type';

export type FoundMedia = {
  error: any;
  image: MediaItem[];
  audio: MediaItem[];
  video: MediaItem[];
  tabInfo: NullableChromeTab;
}
