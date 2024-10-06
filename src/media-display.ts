import {updateAccordionData} from './downloader/accordion';
import {mediaInTabs, tabExpanded} from './media-in-tabs';
import {ItemTypeEnum, MediaItem} from './types/media-in-tabs.type';
import {q} from './utils/dom-functions';
import {getCurrentSection} from './utils/utils';


export function getAllMediaToDisplay(tabUuid?: string): MediaItem[] {
  const type = getCurrentSection() as ItemTypeEnum;

  let data = mediaInTabs.filter(item => item.type === type);
  if (tabUuid) {
    data = data.filter(mediaItem => mediaItem.tabUuid === tabUuid);
  }
  return data;
}

export function displayMedia() {
  updateAccordionData();
  const countAll = q('.count-all')!;
  countAll.innerHTML = mediaInTabs.length.toString();
}

export function setTabExpanded(tabUuid: string, value: boolean) {
  tabExpanded[tabUuid] = value;
}

export function isTabExpanded(tabUuid: string): boolean {
  return tabExpanded[tabUuid];
}

