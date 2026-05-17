import {displayMedia} from '../../media-display';
import {mediaInTabs} from '../../media-in-tabs';
import {getFiltersOpenValue, getFiltersValue} from '../../storage/storage-fn';
import {ItemTypeEnum} from '../../types/media-in-tabs.type';
import {setStorageValue} from '../../utils/chrome-api';
import {
  createDivElement,
  createIconElement,
  createSpanElement,
  hide,
  q,
  show,
  toggleClass,
} from '../../utils/dom-functions';
import {getCurrentSection} from '../../utils/utils';
import {setTopContainerHeightVar} from '../dom-listeners';

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

const DYNAMIC_FILTER_SELECTORS = ['imageType', 'videoType', 'videoQuality', 'audioType'] as const;
type DynamicFilterSelector = typeof DYNAMIC_FILTER_SELECTORS[number];

const FILTER_KEYS_BY_TYPE = {
  [ItemTypeEnum.IMAGE]: ['minWidth', 'maxWidth', 'minHeight', 'maxHeight', 'imageType'],
  [ItemTypeEnum.VIDEO]: ['videoType', 'videoQuality'],
  [ItemTypeEnum.AUDIO]: ['audioType'],
};

const FILTER_ENTRIES_BY_TYPE = {
  [ItemTypeEnum.IMAGE]: [
    ['minWidth', 'Min width'],
    ['maxWidth', 'Max width'],
    ['minHeight', 'Min height'],
    ['maxHeight', 'Max height'],
    ['imageType', 'Type'],
  ],
  [ItemTypeEnum.VIDEO]: [
    ['videoType', 'Type'],
    ['videoQuality', 'Quality'],
  ],
  [ItemTypeEnum.AUDIO]: [
    ['audioType', 'Type'],
  ],
};

function getFilterKeysForType(type: ItemTypeEnum) {
  return FILTER_KEYS_BY_TYPE[type] || FILTER_KEYS_BY_TYPE[ItemTypeEnum.IMAGE];
}

function getFilterEntriesForType(type: ItemTypeEnum) {
  return FILTER_ENTRIES_BY_TYPE[type] || FILTER_ENTRIES_BY_TYPE[ItemTypeEnum.IMAGE];
}

function getArrayFilterValue(key: string) {
  const value = FILTERS[key];
  if (Array.isArray(value)) {
    return value;
  }
  if (!value) {
    return [];
  }
  return [value];
}

function collectFilterValues() {
  ['minWidth', 'maxWidth', 'minHeight', 'maxHeight'].forEach((key: string) => {
    const input = q(`input#${key}`) as HTMLInputElement;
    input.value = FILTERS[key];
  });
  ['imageType', 'videoQuality', 'videoType', 'audioType'].forEach((key: string) => {
    const select = q(`select#${key}`) as HTMLSelectElement;
    const values = FILTERS[key];
    const chips = select.closest('.label-group')!.querySelector('.chips')!;

    chips.innerHTML = '';
    values.forEach((val: string) => {
      const chip = getChip(val);
      chips.appendChild(chip);
    });
  });
  updateActiveFilterStrip();
  updateDynamicFilterOptions();
}

export function isFiltered(type: ItemTypeEnum) {
  const keysForType = getFilterKeysForType(type);
  return Object.keys(FILTERS)
    .filter(k => keysForType.includes(k))
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
  return createDivElement({class: 'chip'}, [
    createSpanElement({html: value}),
    createIconElement('close'),
  ]);
}

function filtersChanged() {
  setStorageValue({filters: FILTERS});
  updateFiltersIconActive();
  displayMedia();
}

export function updateFiltersIconActive() {
  toggleClass('.open-filters', 'active-filters', isFiltered(getCurrentSection()));
  updateActiveFilterStrip();
  updateDynamicFilterOptions();
}

function getAvailableTypeOptions(type: ItemTypeEnum) {
  const extensions = new Set(
    mediaInTabs
      .filter(item => item.type === type && item.extension)
      .map(item => item.extension!.toLowerCase()),
  );

  if (type === ItemTypeEnum.IMAGE && (extensions.has('jpg') || extensions.has('jpeg'))) {
    extensions.delete('jpg');
    extensions.delete('jpeg');
    extensions.add('jpg,jpeg');
  }

  return Array.from(extensions)
    .sort((a, b) => a.localeCompare(b))
    .map(value => ({
      value,
      label: value === 'jpg,jpeg' ? 'JPG' : value.toUpperCase(),
    }));
}

function getTypeBySelectId(selectId: DynamicFilterSelector) {
  const typeBySelectId = {
    imageType: ItemTypeEnum.IMAGE,
    videoType: ItemTypeEnum.VIDEO,
    videoQuality: ItemTypeEnum.VIDEO,
    audioType: ItemTypeEnum.AUDIO,
  };
  return typeBySelectId[selectId];
}

function getAvailableQualityOptions() {
  return Array.from(new Set(
    mediaInTabs
      .filter(item => item.type === ItemTypeEnum.VIDEO && item.properties.quality)
      .map(item => item.properties.quality),
  ))
    .sort((a, b) => b.localeCompare(a, undefined, {numeric: true}))
    .map(value => ({value, label: value}));
}

function getAvailableFilterOptions(selectId: DynamicFilterSelector) {
  if (selectId === 'videoQuality') {
    return getAvailableQualityOptions();
  }
  return getAvailableTypeOptions(getTypeBySelectId(selectId));
}

export function updateDynamicFilterOptions() {
  DYNAMIC_FILTER_SELECTORS.forEach(selectId => {
    const select = q(`select#${selectId}`) as HTMLSelectElement;
    const currentValue = select.value;
    const options = getAvailableFilterOptions(selectId);

    select.innerHTML = '';
    select.appendChild(new Option(options.length ? 'select' : 'nothing found', ''));
    options.forEach(({value, label}) => {
      select.appendChild(new Option(label, value));
    });
    select.value = currentValue;
    select.disabled = !options.length;
  });
}

function getActiveFilterEntries(type: ItemTypeEnum) {
  return getFilterEntriesForType(type)
    .flatMap(([key, label]) => {
      const value = FILTERS[key];
      if (Array.isArray(value)) {
        return value.map(val => `${label}: ${val}`);
      }
      return value
        ? [`${label}: ${value}`]
        : [];
    });
}

function updateActiveFilterStrip() {
  const strip = q('.active-filter-strip');
  const entries = getActiveFilterEntries(getCurrentSection());
  strip.innerHTML = '';
  strip.hidden = !entries.length;
  entries.forEach(entry => {
    strip.appendChild(createSpanElement({class: 'active-filter-chip', html: entry}));
  });
}

function resetFilters() {
  const type = getCurrentSection();
  getFilterKeysForType(type).forEach(key => {
    FILTERS[key] = Array.isArray(FILTERS[key])
      ? []
      : null;
  });
  filtersChanged();
  collectFilterValues();
}

function initFiltersListeners() {
  const filtersDiv = q('.filters');

  filtersDiv.addEventListener('change', e => {
    const target: any = e.target;
    if (target.matches('select')) {
      const values = getArrayFilterValue(target.id);
      if (!target.value) {
        return;
      }
      if (values.includes(target.value)) {
        target.value = '';
        return;
      }
      const chip = getChip(target.value);
      target.closest('.label-group').querySelector('.chips').appendChild(chip);

      FILTERS[target.id] = [...values, target.value];

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

    if (target.closest('.filters .open-filters')) {
      show('.filters .filters-content');
      setStorageValue({filtersOpen: true});
      setTopContainerHeightVar();
      return;
    }

    if (target.closest('.filters .close-filters')) {
      hide('.filters .filters-content');
      setStorageValue({filtersOpen: false});
      setTopContainerHeightVar();
      return;
    }

    if (target.closest('.filters .reset-filters')) {
      resetFilters();
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
