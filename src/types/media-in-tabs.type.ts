import {NullableString} from './common.type';

export type MediaItemProperties = {
  width: number;
  height: number;
  quality: string;
  duration: number;
  durationStr: string;
}

export type MediaItem = {
  tabId: number;
  tabUuid: string;
  itemIndex: string;
  uuid: string;
  src: string;
  extension: NullableString;
  type: ItemTypeEnum;
  alt: NullableString;
  selected: boolean;
  poster: NullableString;
  properties: MediaItemProperties;
}

export enum ItemTypeEnum {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
}
