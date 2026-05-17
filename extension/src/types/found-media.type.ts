import {MediaItem, QuickMediaItem} from './media-in-tabs.type';

export type FoundMedia = {
  error: any;
  media: MediaItem[];
  jobHash: string;
}

export type FoundMediaQuick = {
  error: any;
  media: QuickMediaItem[];
}
