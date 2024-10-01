export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum DefaultActionType {
  POPUP = 'popup',
  SIDE_PANEL = 'side-panel'
}

export type PreviousVersionType = string | null;
export type StorageDef = {
  theme: ThemeType;
  defaultAction: DefaultActionType;
  previousVersion: PreviousVersionType
}

export type StorageKey = keyof StorageDef;

export const DEFAULT_SETTINGS: StorageDef = {
  theme: ThemeType.SYSTEM,
  defaultAction: DefaultActionType.POPUP,
  previousVersion: null,
};
export const DEFAULT_SETTINGS_KEYS: StorageKey[] = Object.keys(DEFAULT_SETTINGS) as StorageKey[];
