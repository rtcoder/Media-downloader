import {ItemTypeEnum, MediaItem} from '../../types/media-in-tabs.type';
import {getFilters} from './filters';

export function applyFilters(type: ItemTypeEnum, mediaToDisplay: MediaItem[]) {
  if (type === ItemTypeEnum.IMAGE) {
    return filterImages(mediaToDisplay);
  }

  if (type === ItemTypeEnum.AUDIO) {
    return filterAudios(mediaToDisplay);
  }

  if (type === ItemTypeEnum.VIDEO) {
    return filterVideos(mediaToDisplay);
  }

  return mediaToDisplay.map(item => {
    item.display = true;
    return item;
  });
}

function filterImages(items: MediaItem[]): MediaItem[] {
  const filters = getFilters();
  return items.map(item => {
    item.display = true;

    const {width, height} = item.properties;

    if (filters.maxWidth && width > filters.maxWidth) {
      item.display = false;
    }

    if (filters.minWidth && width < filters.minWidth) {
      item.display = false;
    }

    if (filters.minHeight && height < filters.minHeight) {
      item.display = false;
    }

    if (filters.maxHeight && height > filters.maxHeight) {
      item.display = false;
    }

    if (!!filters.imageType?.length && !filters.imageType.includes(item.extension)) {
      item.display = false;
    }

    return item;
  });
}

function filterAudios(items: MediaItem[]) {
  const filters = getFilters();
  return items.map(item => {
    item.display = true;

    if (!!filters.audioType?.length && !filters.audioType.includes(item.extension)) {
      item.display = false;
    }

    return item;
  });
}

function filterVideos(items: MediaItem[]) {
  const filters = getFilters();
  return items.map(item => {
    item.display = true;

    if (!!filters.videoQuality?.length && !filters.videoQuality.includes(item.properties.quality)) {
      item.display = false;
    }

    if (!!filters.videoType?.length && !filters.videoType.includes(item.extension)) {
      item.display = false;
    }

    return item;
  });
}
