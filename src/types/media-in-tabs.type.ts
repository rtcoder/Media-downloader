import {NullableString} from './common.type';

export type MediaItemProperties = {
  width: number;
  height: number;
  quality: string;
  duration: number;
  durationStr: string;
}

export type MediaItem = {
  uuid: string;
  src: string;
  type: NullableString;
  alt: NullableString;
  selected: boolean;
  poster: NullableString;
  properties: MediaItemProperties;
}

export type MediaInfo = {
  image: MediaItem[];
  audio: MediaItem[];
  video: MediaItem[];
}

export enum MediaInfoKeyEnum {
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
}

export type MediaInfoKey = MediaInfoKeyEnum;

export type MediaInfoKeys = MediaInfoKey[];

export type MediaInTabElements = {
  tabUuid: string;
  media: MediaInfo;
}

type MediaInTab = {
  tabId: number;
  elements: MediaInTabElements[];
}

export type MediaInTabs = MediaInTab[];
