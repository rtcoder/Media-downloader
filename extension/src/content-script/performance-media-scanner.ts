import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {getMediaTypeFromUrl, isIgnoredLinkedAsset} from './filters-fn';
import {LinkedMediaCandidate} from './linked-media-types';

export function findLoadedMediaResources(
  performanceRef: Performance = performance,
  pageUrl: string = window.location.href,
): LinkedMediaCandidate[] {
  const seen = new Set<string>();

  return performanceRef.getEntriesByType('resource')
    .map(entry => entry.name)
    .filter(url => !isIgnoredLinkedAsset(url))
    .map(url => ({src: url, type: getMediaTypeFromUrl(url)}))
    .filter((item): item is {src: string; type: ItemTypeEnum} => !!item.type)
    .filter(item => {
      if (seen.has(item.src)) {
        return false;
      }
      seen.add(item.src);
      return true;
    })
    .map(item => ({
      src: item.src,
      type: item.type,
      poster: null,
      sourceKind: 'linked',
      sourceUrl: pageUrl,
      label: 'loaded resource',
    }));
}
