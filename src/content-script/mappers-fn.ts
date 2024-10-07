import {NullableString} from '../types/common.type';
import {ItemTypeEnum, MediaItem} from '../types/media-in-tabs.type';
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

export function mapToFullInfo(
  src: string = '',
  altOrElement: Element | NullableString = null,
  poster: NullableString | undefined = undefined,
) {
  let alt: NullableString = null;
  if (altOrElement !== null) {
    if (typeof altOrElement !== 'string') {
      alt = getAltFromElement(altOrElement);
    }
  }

  const info: any = {src, alt};

  if (poster !== undefined) {
    info.poster = poster;
  }

  return info;
}

export async function mapToFinalResultArray(data: any[], type: ItemTypeEnum): Promise<MediaItem[]> {
  const promises = data.map(item => mapToFinalResultItem(item, type));
  const results = await Promise.all(promises);
  return removeDuplicateOrEmpty(results);
}

async function mapToFinalResultItem(item: MixedObject, type: ItemTypeEnum): Promise<MediaItem> {
  const src = relativeUrlToAbsolute(item.src) || '';
  let extension: NullableString = null;
  if (src.length) {
    extension = await getFileType(src);
  }
  return {
    tabUuid: '',
    tabId: -1,
    itemIndex: '',
    src,
    extension,
    type,
    alt: item.alt,
    selected: false,
    poster: item.poster ? relativeUrlToAbsolute(item.poster) : null,
    uuid: item.uuid || getUuid(item.src),
    properties: {
      width: 0,
      height: 0,
      duration: 0,
      durationStr: '',
      quality: 'SD',
    },
  };
}
