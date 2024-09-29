export interface MediaItem {
  src: string;
  type: string | null;
  alt: string | null;
  selected: boolean;
}

export interface VideoItem extends MediaItem {
  poster: string | null;
}

export interface MediaInfo {
  images: MediaItem[];
  audios: MediaItem[];
  videos: VideoItem[];
}

export interface TabData {
  id: number;
  favIconUrl: string;
  url: string;
  title: string;
  isRestricted: boolean;
}

export interface MediaInTab {
  tab: TabData;
  media: MediaInfo;
}

export interface TabExpanded {
  [key: string | number]: boolean; // Where the key is the tabId
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
  showHeader: boolean;
  tab: TabData;
  items: DisplayMediaItem[];
}
