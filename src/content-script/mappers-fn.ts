import {NullableString} from '../types/common.type';
import {MediaItem} from '../types/media-in-tabs.type';
import {MixedObject} from '../types/mixed-object.type';
import {getUuid} from '../utils/utils';
import {getAltFromElement} from './extractors-fn';
import {getFileType} from './file-type-fn';
import {removeDuplicateOrEmpty} from './filters-fn';

export function relativeUrlToAbsolute(url: NullableString): NullableString {
  if (url === null) {
    return null;
  }
  return url.startsWith('/') ? `${window.location.origin}${url}` : url;
}

export async function mapToFullInfo(
  src: string = '',
  altOrElement: Element | NullableString = null,
  poster: NullableString | undefined = undefined,
) {
  let type: NullableString = null;
  if (src.length) {
    type = await getFileType(src);
  }

  let alt: NullableString = null;
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

export function mapToFinalResultArray(data: any[]): MediaItem[] {
  return removeDuplicateOrEmpty(data.map(mapToFinalResultItem));
}

function mapToFinalResultItem(item: MixedObject): MediaItem {
  const data: MediaItem = {
    src: relativeUrlToAbsolute(item.src) || '',
    type: item.type,
    alt: item.alt,
    selected: false,
    poster: null,
    uuid: item.uuid || getUuid(item.src),
    properties: {
      width: 0,
      height: 0,
      duration: 0,
      durationStr: '',
      quality: 'SD',
    },
  };
  if (item.poster === undefined) {
    return data;
  }
  data.poster = item.poster ? relativeUrlToAbsolute(item.poster) : null;

  return data;
}
