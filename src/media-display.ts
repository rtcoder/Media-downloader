import {updateAccordionData} from './downloader/accordion';
import {mediaInTabs, tabExpanded} from './media-in-tabs';
import {MediaToDisplay} from './types/media-display.type';
import {MediaInfo, MediaInfoKey, MediaItem} from './types/media-in-tabs.type';
import {q} from './utils/dom-functions';
import {countAllMedia, getCurrentSection, mapMediaItemToDisplayMediaItem} from './utils/utils';


export function getAllMediaToDisplay(): MediaToDisplay[] {
  const currentSection = getCurrentSection() as MediaInfoKey;

  const mapFn = (media: MediaInfo) => {
    return media[currentSection].map((item: MediaItem) => {
      return mapMediaItemToDisplayMediaItem(item, currentSection);
    });
  };

  return mediaInTabs.map(group => {
    const data = group.elements.map(({media, tabUuid}) => {
      const items = mapFn(media);
      return {tabUuid, items};
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

