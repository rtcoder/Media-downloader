import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {MixedObject} from '../types/mixed-object.type';
import {getStorageValue} from '../utils/chrome-api';
import {DEFAULT_SETTINGS, DefaultActionType, PreviousVersionType, ThemeType} from './storage-def';

export function getStorageDefaultActionValue(callback: (value: DefaultActionType) => void) {
  getStorageValue({defaultAction: DefaultActionType.POPUP}, ({defaultAction}) => {
    if (!defaultAction) {
      defaultAction = DEFAULT_SETTINGS.defaultAction;
    }
    callback(defaultAction);
  });
}

export function getStorageThemeValue(callback: (value: ThemeType) => void) {
  getStorageValue({theme: ThemeType.SYSTEM}, ({theme}) => {
    if (!theme) {
      theme = DEFAULT_SETTINGS.theme;
    }
    callback(theme);
  });
}

export function getStoragePreviousVersionValue(callback: (value: PreviousVersionType) => void) {
  getStorageValue({previousVersion: null}, ({previousVersion}) => {
    if (!previousVersion) {
      previousVersion = DEFAULT_SETTINGS.previousVersion;
    }
    callback(previousVersion);
  });
}

export function getShowChangeLogLinkValue(callback: (value: boolean) => void) {
  getStorageValue({showChangelogLink: false}, ({showChangelogLink}) => {
    callback(!!showChangelogLink);
  });
}

export function getLastOpenSectionValue(callback: (value: ItemTypeEnum) => void) {
  getStorageValue({lastOpenSection: ItemTypeEnum.IMAGE}, ({lastOpenSection}) => {
    if (!lastOpenSection) {
      lastOpenSection = DEFAULT_SETTINGS.lastOpenSection;
    }
    callback(lastOpenSection);
  });
}

export function getFiltersValue(callback: (value: MixedObject) => void) {
  getStorageValue({filters: {}}, ({filters}) => {
    if (!filters) {
      filters = DEFAULT_SETTINGS.filters;
    }
    callback(filters);
  });
}

export function getFiltersOpenValue(callback: (value: boolean) => void) {
  getStorageValue({filtersOpen: false}, ({filtersOpen}) => {
    callback(!!filtersOpen);
  });
}
