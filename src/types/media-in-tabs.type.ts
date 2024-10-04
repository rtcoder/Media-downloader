import {NullableString} from './common.type';

export type MediaItem = {
  uuid: string;
  src: string;
  type: NullableString;
  alt: NullableString;
  selected: boolean;
  poster: NullableString;
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
