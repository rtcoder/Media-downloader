import {NullableString} from './common.type';
import {MediaInfoKey} from './media-in-tabs.type';

export interface DisplayMediaItem {
  uuid: string;
  src: string;
  type: MediaInfoKey;
  filetype: NullableString;
  alt: NullableString;
  poster?: NullableString; // Optional, for videos
  selected: boolean;
}

export interface MediaToDisplayItem {
  tabUuid: string;
  items: DisplayMediaItem[];
}

export interface MediaToDisplay {
  tabId: number;
  data: MediaToDisplayItem[];
}

