import {describe, expect, it} from 'vitest';
import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {findLoadedMediaResources} from './performance-media-scanner';

describe('performance media scanner', () => {
  it('detects loaded media resources by URL', () => {
    const performanceRef = {
      getEntriesByType: () => [
        {name: 'https://cdn.example.com/image.webp', initiatorType: 'img'},
        {name: 'https://cdn.example.com/player.js', initiatorType: 'script'},
        {name: 'https://cdn.example.com/movie.mp4?token=abc', initiatorType: 'video'},
        {name: 'https://cdn.example.com/movie.mp4?token=abc', initiatorType: 'video'},
      ],
    } as unknown as Performance;

    expect(findLoadedMediaResources(performanceRef, 'https://example.com/page')).toEqual([
      {
        src: 'https://cdn.example.com/image.webp',
        type: ItemTypeEnum.IMAGE,
        poster: null,
        sourceKind: 'linked',
        sourceUrl: 'https://example.com/page',
        label: 'loaded resource',
      },
      {
        src: 'https://cdn.example.com/movie.mp4?token=abc',
        type: ItemTypeEnum.VIDEO,
        poster: null,
        sourceKind: 'linked',
        sourceUrl: 'https://example.com/page',
        label: 'loaded resource',
      },
    ]);
  });
});
