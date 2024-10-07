import {NullableString} from './common.type';

export type MediaItemProperties = {
  width: number;
  height: number;
  quality: string;
  duration: number;
  durationStr: string;
}

export type MediaItem = {
  order: number;
  tabId: number;
  tabUuid: string;
  itemIndex: string;
  uuid: string;
  src: string;
  extension: NullableString;
  type: ItemTypeEnum;
  selected: boolean;
  poster: NullableString;
  properties: MediaItemProperties;
}

export type QuickMediaItem = {
  src: string;
}

export enum ItemTypeEnum {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
}
