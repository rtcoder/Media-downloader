import {NullableString} from '../types/common.type';
import {MediaInfoKey, MediaInfoKeyEnum} from '../types/media-in-tabs.type';
import {MixedObject} from '../types/mixed-object.type';

export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum DefaultActionType {
  POPUP = 'popup',
  SIDE_PANEL = 'side-panel'
}

export type PreviousVersionType = NullableString;

export type StorageDef = {
  theme: ThemeType;
  defaultAction: DefaultActionType;
  previousVersion: PreviousVersionType;
  showChangelogLink: boolean;
  lastOpenSection: MediaInfoKey;
  filters: MixedObject;
  filtersOpen: boolean;
}

export type StorageKey = keyof StorageDef;

export type StorageKeys = StorageKey[];

export const DEFAULT_SETTINGS: StorageDef = {
  theme: ThemeType.SYSTEM,
  defaultAction: DefaultActionType.POPUP,
  previousVersion: null,
  showChangelogLink: false,
  lastOpenSection: MediaInfoKeyEnum.IMAGE,
  filters: {},
  filtersOpen: false,
};
export const DEFAULT_SETTINGS_KEYS: StorageKeys = Object.keys(DEFAULT_SETTINGS) as StorageKeys;
