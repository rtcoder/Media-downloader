export interface MediaItem {
  uuid: string;
  src: string;
  type: string | null;
  alt: string | null;
  selected: boolean;
  poster: string | null;
}

export interface VideoItem extends MediaItem {
  poster: string | null;
}

export interface MediaInfo {
  image: MediaItem[];
  audio: MediaItem[];
  video: MediaItem[];
}

export interface TabData {
  uuid: string;
  id: number;
  favIconUrl: string;
  url: string;
  title: string;
  isRestricted: boolean;
}

export interface MediaInTabElements {
  tab: TabData;
  media: MediaInfo;
}

export interface MediaInTab {
  tabId: number;
  elements: MediaInTabElements[];
}

export interface TabExpanded {
  [key: string]: boolean; // Where the key is the tabUuid
}

export interface DisplayMediaItem {
  src: string;
  type: 'image' | 'video' | 'audio';
  filetype: string | null;
  alt: string | null;
  poster?: string | null; // Optional, for videos
  selected: boolean;
}

export interface MediaToDisplayItem {
  tab: TabData;
  items: DisplayMediaItem[];
}

export interface MediaToDisplay {
  tabId: number;
  data: MediaToDisplayItem[];
}
