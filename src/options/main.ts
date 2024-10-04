import {DEFAULT_SETTINGS, DEFAULT_SETTINGS_KEYS, StorageDef, StorageKey, StorageKeys} from '../storage/storage-def';
import {getStorageValue, setStorageValue} from '../utils/chrome-api';
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
  setStorageValue(composeDataToSave(), () => {
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
