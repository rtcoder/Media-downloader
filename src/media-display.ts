import {updateAccordionData} from './downloader/accordion';
import {mediaInTabs} from './media-in-tabs';
import {tabExpanded} from './tab-expanded';
import {MediaInfo, MediaToDisplay} from './types/media-display.type';
import {q} from './utils/dom-functions';
import {countAllMedia, getCurrentSection} from './utils/utils';


export function getAllMediaToDisplay(): MediaToDisplay[] {
  const currentSection = getCurrentSection();
  const mapFn = (itemType: string) => ({type, selected, src, poster}: any) => ({
    src,
    poster,
    filetype: type,
    selected,
    type: itemType,
  });
  const sectionMapping: any = {
    image: (media: MediaInfo) => media.image.map(mapFn('image')),
    video: (media: MediaInfo) => media.video.map(mapFn('video')),
    audio: (media: MediaInfo) => media.audio.map(mapFn('audio')),
  };

  const getMediaItems = sectionMapping[currentSection] || (() => []);
  return mediaInTabs.map(group => {
    const data = group.elements.map(({media, tab}) => {
      const items = getMediaItems(media);
      return {tab, items};
    });
    return {
      tabId: group.tabId,
      data,
    };
  });
}

export function displayMedia() {
  const mediaToDisplay = getAllMediaToDisplay();
  console.log(mediaToDisplay);
  updateAccordionData(mediaToDisplay);
  const countAll = q('.count-all')!;
  countAll.innerHTML = countAllMedia(mediaToDisplay).toString();
}

export function setTabExpanded(tabUuid: string, value: boolean) {
  tabExpanded[tabUuid] = value;
}

export function isTabExpanded(tabUuid: string): boolean {
  return tabExpanded[tabUuid];
}

