import {updateAccordionData} from './downloader/accordion';
import {applyFilters} from './downloader/filters/filter-fn';
import {isFiltered} from './downloader/filters/filters';
import {mediaInTabs, tabExpanded} from './media-in-tabs';
import {MediaToDisplay} from './types/media-display.type';
import {MediaInfo, MediaInfoKey, MediaItem} from './types/media-in-tabs.type';
import {q} from './utils/dom-functions';
import {countAllMedia, getCurrentSection, mapMediaItemToDisplayMediaItem} from './utils/utils';


export function getAllMediaToDisplay(): MediaToDisplay[] {
  const type = getCurrentSection() as MediaInfoKey;

  const mapFn = (media: MediaInfo) => {
    return media[type].map((item: MediaItem) => {
      return mapMediaItemToDisplayMediaItem(item, type);
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
  const allMediaCount = countAllMedia(mediaToDisplay).toString();
  let filteredMediaCount = allMediaCount;
  let filteredMediaToDisplay: MediaToDisplay[];
  const type = getCurrentSection();
  if (isFiltered(type)) {
    filteredMediaToDisplay = applyFilters(type, mediaToDisplay);
    filteredMediaCount = countAllMedia(filteredMediaToDisplay).toString();
  }
  const mediaCount = allMediaCount === filteredMediaCount
    ? allMediaCount
    : `${filteredMediaCount} / ${allMediaCount}`;
  updateAccordionData(mediaToDisplay);
  const countAll = q('.count-all')!;
  countAll.innerHTML = mediaCount;
}

export function setTabExpanded(tabUuid: string, value: boolean) {
  tabExpanded[tabUuid] = value;
}

export function isTabExpanded(tabUuid: string): boolean {
  return tabExpanded[tabUuid];
}

