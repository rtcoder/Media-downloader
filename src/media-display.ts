import {updateAccordionData} from './downloader/accordion';
import {mediaInTabs} from './media-in-tabs';
import {tabExpanded} from './tab-expanded';
import {MediaInfo, MediaToDisplayItem} from './types/media-display.type';
import {q} from './utils/dom-functions';
import {countAllMedia, getCurrentSection} from './utils/utils';

export function getAllMediaToDisplay(): MediaToDisplayItem[] {
  const currentSection = getCurrentSection();
  const mapFn = (itemType: string) => ({type, selected, src, poster}: any) => ({
    src,
    poster,
    filetype: type,
    selected,
    type: itemType,
  });
  const sectionMapping: any = {
    images: (media: MediaInfo) => media.images.map(mapFn('image')),
    videos: (media: MediaInfo) => media.videos.map(mapFn('video')),
    audios: (media: MediaInfo) => media.audios.map(mapFn('audio')),
  };

  const getMediaItems = sectionMapping[currentSection] || (() => []);
  return mediaInTabs.map(({media, tab}) => {
    const items = getMediaItems(media);
    return {tab, items, showHeader: true};
  });
}

export function displayMedia() {
  const mediaToDisplay = getAllMediaToDisplay();
  console.log(mediaToDisplay);
  updateAccordionData(mediaToDisplay);
  const countAll = q('.count-all')!;
  countAll.innerHTML = countAllMedia(mediaToDisplay).toString();
}

export function setTabExpanded(tabId: string | number, value: boolean) {
  tabExpanded[tabId] = value;
}

export function isTabExpanded(tabId: string | number): boolean {
  return tabExpanded[tabId];
}

