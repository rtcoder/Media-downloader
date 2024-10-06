import {DisplayMediaItem, MediaToDisplay} from '../../types/media-display.type';
import {MediaInfoKey, MediaInfoKeyEnum} from '../../types/media-in-tabs.type';
import {getFilters} from './filters';

export function applyFilters(type: MediaInfoKey, mediaToDisplay: MediaToDisplay[]) {
  if (type === MediaInfoKeyEnum.IMAGE) {
    return filterMediaToDisplay(mediaToDisplay, filterImages);
  }
  if (type === MediaInfoKeyEnum.AUDIO) {
    return filterMediaToDisplay(mediaToDisplay, filterAudios);
  }
  if (type === MediaInfoKeyEnum.VIDEO) {
    return filterMediaToDisplay(mediaToDisplay, filterVideos);
  }
  return mediaToDisplay;
}

function filterMediaToDisplay(mediaToDisplay: MediaToDisplay[], filterFn: (items: DisplayMediaItem[]) => DisplayMediaItem[]) {
  return mediaToDisplay.map(value => {
    value.data = value.data.map(val => {
      val.items = filterFn(val.items);
      return val;
    });
    return value;
  });
}

function filterImages(items: DisplayMediaItem[]): DisplayMediaItem[] {
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
    return !(!!filters.imageType?.length && !filters.imageType.includes(item.filetype));
  });
}

function filterAudios(items: DisplayMediaItem[]) {
  const filters = getFilters();
  return items.filter(item => {
    if (!!filters.videoQuality?.length && !filters.videoQuality.includes(item.properties.quality)) {
      return false;
    }
    return !(!!filters.audioType?.length && !filters.audioType.includes(item.type));
  });
}

function filterVideos(items: DisplayMediaItem[]) {
  const filters = getFilters();
  return items.filter(item => {
    if (!!filters.videoQuality?.length && !filters.videoQuality.includes(item.properties.quality)) {
      return false;
    }
    return !(!!filters.videoType?.length && !filters.videoType.includes(item.type));
  });
}
