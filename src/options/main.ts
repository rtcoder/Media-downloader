import {DEFAULT_SETTINGS, DEFAULT_SETTINGS_KEYS, StorageDef, StorageKey, StorageKeys} from '../storage/storage-def';
import {MessageEventNameEnum} from '../types/message-event-name.enum';
import {getStorageValue, sendMessage, setStorageValue} from '../utils/chrome-api';
import {getInputValue, q, setInputValue} from '../utils/dom-functions';


function composeDataToSave(): StorageDef {
  const dataToSave: Partial<StorageDef> = {};
  DEFAULT_SETTINGS_KEYS.forEach(key => {
    dataToSave[key] = getInputValue(key) as any;
  });

  return dataToSave as StorageDef;
}

function fillFormWithData(data: Partial<StorageDef>) {
  (Object.keys(data) as StorageKeys)
    .forEach((key: StorageKey) => {
      const value = data[key] || DEFAULT_SETTINGS[key];
      setInputValue(key, value);
    });
}

function saveOptions() {
  const data = composeDataToSave();
  setStorageValue(data, () => {
    sendMessage(MessageEventNameEnum.THEME_CHANGED, {theme: data.theme});
    const status = q('#status');
    status.style.display = 'block';
    setTimeout(() => {
      status.style.removeProperty('display');
    }, 2000);
  });
}

function restoreOptions() {
  getStorageValue(DEFAULT_SETTINGS, fillFormWithData);
}

q('#optionsForm')
  .addEventListener('submit', (event) => {
    event.preventDefault();
    saveOptions();
  });

document.addEventListener('DOMContentLoaded', restoreOptions);
