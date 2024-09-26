interface MediaItem {
  src: string;
  type: string | null;
  alt: string | null;
  selected: boolean;
}

interface VideoItem {
  src: string;
  poster: string | null;
  type: string | null;
  alt: string | null;
  selected: boolean;
}

interface MediaInfo {
  images: MediaItem[];
  audios: MediaItem[];
  videos: VideoItem[];
}

interface TabData {
  id: number;
  favIconUrl: string;
  url: string;
  title: string;
}

interface MediaInTab {
  tab: TabData;
  media: MediaInfo;
}

interface TabExpanded {
  [key: number]: boolean; // Where the key is the tabId
}

interface DisplayMediaItem {
  src: string;
  type: 'image' | 'video' | 'audio';
  filetype: string | null;
  alt: string | null;
  poster?: string | null; // Optional, for videos
  selected: boolean;
}

interface MediaToDisplayItem {
  showHeader: boolean;
  tab: TabData;
  items: DisplayMediaItem[];
}
