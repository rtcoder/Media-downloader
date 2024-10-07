import {QuickMediaItem} from '../../types/media-in-tabs.type';
import {removeDuplicateOrEmpty} from '../filters-fn';
import {relativeUrlToAbsolute} from '../mappers-fn';

export function mapToFinalQuickResultArray(data: any[]): QuickMediaItem[] {
  return removeDuplicateOrEmpty(data.map(item => ({
    src: relativeUrlToAbsolute(item.src) || '',
  })));
}
