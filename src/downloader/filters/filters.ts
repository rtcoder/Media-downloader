import {displayMedia} from '../../media-display';
import {getFiltersOpenValue, getFiltersValue} from '../../storage/storage-fn';
import {ItemTypeEnum} from '../../types/media-in-tabs.type';
import {setStorageValue} from '../../utils/chrome-api';
import {createDivElement, createIconElement, createSpanElement, hide, q, show} from '../../utils/dom-functions';

const FILTERS: any = {
  minWidth: null,
  maxWidth: null,
  minHeight: null,
  maxHeight: null,
  imageType: [],
  videoQuality: [],
  videoType: [],
  audioType: [],
};

function collectFilterValues() {
  ['minWidth', 'maxWidth', 'minHeight', 'maxHeight'].forEach((key: string) => {
    const input = q(`input#${key}`) as HTMLInputElement;
    const value = FILTERS[key];
    if (value) {
      input.value = value;
    }
  });
  ['imageType', 'videoQuality', 'videoType', 'audioType'].forEach((key: string) => {
    const select = q(`select#${key}`) as HTMLSelectElement;
    const values = FILTERS[key];
    const chips = select.closest('.label-group')!.querySelector('.chips')!;

    values.forEach((val: string) => {
      const chip = getChip(val);
      chips.appendChild(chip);
    });
  });
}

export function isFiltered(type: ItemTypeEnum) {
  const keysByType = {
    [ItemTypeEnum.IMAGE]: ['minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'imageType'],
    [ItemTypeEnum.VIDEO]: ['videoType', 'videoQuality'],
    [ItemTypeEnum.AUDIO]: ['audioType'],
  };

  return Object.keys(FILTERS)
    .filter(k => keysByType[type].includes(k))
    .some(k => !!FILTERS[k]?.length);
}

export function initFilters() {
  initFiltersListeners();
  getFiltersValue(filters => {
    Object.keys(filters).forEach(k => {
      FILTERS[k] = filters[k];
    });
    collectFilterValues();
  });
  getFiltersOpenValue(filtersOpen => {
    if (filtersOpen) {
      show('.filters .filters-content');
    } else {
      hide('.filters .filters-content');
    }
  });
}

function getChip(value: string) {
  const chip = createDivElement({class: 'chip'}, [
    createSpanElement({html: value}),
    createIconElement('close'),
  ]);
  return chip;
}

function filtersChanged() {
  setStorageValue({filters: FILTERS});
  console.log({FILTERS});
  displayMedia();
}

function initFiltersListeners() {
  const filtersDiv = q('.filters');
  filtersDiv.addEventListener('change', e => {
    const target: any = e.target;
    if (target.matches('select')) {
      if (!target.value) {
        return;
      }
      if (FILTERS[target.id].includes(target.value)) {
        target.value = '';
        return;
      }
      const chip = getChip(target.value);
      target.closest('.label-group').querySelector('.chips').appendChild(chip);

      FILTERS[target.id].push(target.value);

      filtersChanged();
      target.value = '';
      return;
    }
  });

  filtersDiv.addEventListener('input', e => {
    const target: any = e.target;
    if (target.matches('input')) {
      if (!target.value) {
        FILTERS[target.id] = null;
      } else {
        FILTERS[target.id] = target.value;
      }

      filtersChanged();
      return;
    }
  });

  filtersDiv.addEventListener('click', e => {
    const target: any = e.target;
    if (target.matches('.filters .x-icon.open-filters')) {
      show('.filters .filters-content');
      setStorageValue({filtersOpen: true});
      return;
    }
    if (target.matches('.filters .close-filters')) {
      hide('.filters .filters-content');
      setStorageValue({filtersOpen: false});
      return;
    }
    if (target.matches('.chip .x-icon')) {
      const chipValue = target.parentElement.querySelector('span').textContent;
      const filterKey = target.closest('.label-group').querySelector('select').id;

      const filterIndex = FILTERS[filterKey].indexOf(chipValue);
      FILTERS[filterKey].splice(filterIndex, 1);
      target.parentElement.remove();

      filtersChanged();

      return;
    }
  });

}

export function getFilters() {
  return FILTERS;
}
