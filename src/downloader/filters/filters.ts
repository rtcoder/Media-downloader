import {q} from '../../utils/dom-functions';

const FILTERS: any = {
  minWidth: null,
  maxWidth: null,
  minHeight: null,
  maxHeight: null,
  imageType: null,
  videoQuality: null,
  videoType: null,
  audioType: null,
};

function collectFilterValues() {
  ['minWidth', 'maxWidth', 'minHeight', 'maxHeight'].forEach((key: string) => {
    const input = q(`input#${key}`) as HTMLInputElement;
    const value = input.value;

    FILTERS[key] = value || null;
  });
}
