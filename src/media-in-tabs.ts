import {ItemTypeEnum, MediaItem} from './types/media-in-tabs.type';
import {TabExpanded, TabInfo} from './types/tab-data.type';

export const mediaInTabs: MediaItem[] = [];

export const tabExpanded: TabExpanded = {};

export const tabsInfo: TabInfo = {};
export const tabCollections: number[] = [];//contains tabs IDs

export function getTabsFromCollection(tabId: number) {
  return Object.values(tabsInfo).filter(tabInfo => tabInfo.id === tabId);
}

export function getMediaByTabUuid(uuid: string, type: ItemTypeEnum) {
  return mediaInTabs.find(mediaItem => mediaItem.uuid === uuid && mediaItem.type === type);
}
