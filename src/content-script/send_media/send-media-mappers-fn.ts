import {NullableString} from '../../types/common.type';
import {ItemTypeEnum, MediaItem} from '../../types/media-in-tabs.type';
import {MixedObject} from '../../types/mixed-object.type';
import {getUuid} from '../../utils/utils';
import {getFileType} from '../file-type-fn';
import {removeDuplicateOrEmpty} from '../filters-fn';
import {relativeUrlToAbsolute} from '../mappers-fn';

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
  let srcForUuid: string = '';

  if (src.length) {
    srcForUuid = src;
    if (src.includes('?')) {
      srcForUuid = src.split('?')[0];
    }
  }

  return {
    display: true,
    order: 0,
    tabUuid: '',
    tabId: -1,
    itemIndex: '',
    src,
    extension,
    type,
    selected: false,
    poster: item.poster ? relativeUrlToAbsolute(item.poster) : null,
    uuid: item.uuid || getUuid(srcForUuid),
    properties: {
      width: 0,
      height: 0,
      duration: 0,
      durationStr: '',
      quality: 'SD',
    },
  };
}
