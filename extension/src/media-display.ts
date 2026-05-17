import {updateAccordionData} from './downloader/accordion/accordion';
import {mediaInTabs, tabExpanded} from './media-in-tabs';
import {NullableString} from './types/common.type';
import {ItemTypeEnum, MediaItem} from './types/media-in-tabs.type';


export function getAllMediaToDisplay(tabUuid?: NullableString, type?: ItemTypeEnum | null): MediaItem[] {
  let data = mediaInTabs;
  if (type) {
    data = data.filter(item => item.type === type);
  }
  if (tabUuid) {
    data = data.filter(mediaItem => mediaItem.tabUuid === tabUuid);
  }
  return data;
}

export function displayMedia() {
  updateAccordionData();
}

export function setTabExpanded(tabUuid: string, value: boolean) {
  tabExpanded[tabUuid] = value;
}

export function isTabExpanded(tabUuid: string): boolean {
  return tabExpanded[tabUuid];
}

