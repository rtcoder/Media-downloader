import {updateAccordionData} from './downloader/accordion';
import {mediaInTabs} from './media-in-tabs';
import {tabExpanded} from './tab-expanded';
import {MediaInfo, MediaItem, MediaToDisplay} from './types/media-display.type';
import {q} from './utils/dom-functions';
import {countAllMedia, getCurrentSection, mapMediaItemToDisplayMediaItem} from './utils/utils';


export function getAllMediaToDisplay(): MediaToDisplay[] {
  const currentSection = getCurrentSection() as keyof MediaInfo;

  const mapFn = (media: MediaInfo) => {
    return media[currentSection].map((item: MediaItem) => {
      return mapMediaItemToDisplayMediaItem(item, currentSection);
    });
  };

  return mediaInTabs.map(group => {
    const data = group.elements.map(({media, tab}) => {
      const items = mapFn(media);
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

