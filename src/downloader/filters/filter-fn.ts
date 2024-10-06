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
  return mediaToDisplay;
}

function filterImages(items: MediaItem[]): MediaItem[] {
  const filters = getFilters();
  return items.filter(item => {
    const {width, height} = item.properties;
    if (filters.maxWidth && width > filters.maxWidth) {
      return false;
    }
    if (filters.minWidth && width < filters.minWidth) {
      return false;
    }
    if (filters.minHeight && height < filters.minHeight) {
      return false;
    }
    if (filters.maxHeight && height > filters.maxHeight) {
      return false;
    }
    return !(!!filters.imageType?.length && !filters.imageType.includes(item.extension));
  });
}

function filterAudios(items: MediaItem[]) {
  const filters = getFilters();
  return items.filter(item => {
    if (!!filters.videoQuality?.length && !filters.videoQuality.includes(item.properties.quality)) {
      return false;
    }
    return !(!!filters.audioType?.length && !filters.audioType.includes(item.extension));
  });
}

function filterVideos(items: MediaItem[]) {
  const filters = getFilters();
  return items.filter(item => {
    if (!!filters.videoQuality?.length && !filters.videoQuality.includes(item.properties.quality)) {
      return false;
    }
    return !(!!filters.videoType?.length && !filters.videoType.includes(item.extension));
  });
}
