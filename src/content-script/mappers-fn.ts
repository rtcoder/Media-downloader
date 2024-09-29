import {MediaItem, VideoItem} from '../types/media-display.type';
import {MixedObject} from '../types/mixed-object.type';
import {getAltFromElement} from './extractors-fn';
import {getFileType} from './file-type-fn';
import {removeDuplicateOrEmpty} from './filters-fn';

export function relativeUrlToAbsolute(url: string | null): string | null {
  if (url === null) {
    return null;
  }
  return url.startsWith('/') ? `${window.location.origin}${url}` : url;
}

export async function mapToFullInfo(
  src: string = '',
  altOrElement: Element | string | null = null,
  poster: string | null | undefined = undefined,
) {
  let type: string | null = null;
  if (src.length) {
    type = await getFileType(src);
  }

  let alt: string | null = null;
  if (altOrElement !== null) {
    if (typeof altOrElement !== 'string') {
      alt = getAltFromElement(altOrElement);
    }
  }

  const info: any = {src, alt, type};

  if (poster !== undefined) {
    info.poster = poster;
  }

  return info;
}

export function mapToFinalResultArray(data: any[]): (MediaItem | VideoItem)[] {
  return removeDuplicateOrEmpty(data.map(mapToFinalResultItem));
}

function mapToFinalResultItem(item: MixedObject): MediaItem | VideoItem {
  const data: MediaItem | VideoItem = {
    src: relativeUrlToAbsolute(item.src) || '',
    type: item.type,
    alt: item.alt,
    selected: false,
  };
  if (item.poster === undefined) {
    return data as MediaItem;
  }
  (data as VideoItem).poster = item.poster ? relativeUrlToAbsolute(item.poster) : null;

  return data as VideoItem;
}
