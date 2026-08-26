import {ItemTypeEnum} from '../types/media-in-tabs.type';

export type LinkedMediaCandidate = {
  src: string;
  type: ItemTypeEnum;
  poster?: string | null;
  sourceKind?: 'linked';
  sourceUrl: string;
  label?: string;
};
