import {getStorageValue} from '../utils/chrome-api';
import {DefaultActionType, PreviousVersionType, ThemeType} from './storage-def';

export function getStorageDefaultActionValue(callback: (value: DefaultActionType) => void) {
  getStorageValue({defaultAction: DefaultActionType.POPUP}, ({defaultAction}) => {
    if (!defaultAction) {
      defaultAction = DefaultActionType.POPUP;
    }
    callback(defaultAction);
  });
}

export function getStorageThemeValue(callback: (value: ThemeType) => void) {
  getStorageValue({theme: ThemeType.SYSTEM}, ({theme}) => {
    if (!theme) {
      theme = ThemeType.SYSTEM;
    }
    callback(theme);
  });
}

export function getStoragePreviousVersionValue(callback: (value: PreviousVersionType) => void) {
  getStorageValue({previousVersion: null}, ({previousVersion}) => {
    if (!previousVersion) {
      previousVersion = null;
    }
    callback(previousVersion);
  });
}
