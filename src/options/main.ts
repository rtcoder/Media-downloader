import {DEFAULT_SETTINGS, StorageDef, StorageKey} from '../storage/storage-def';
import {getStorageValue} from '../utils/chrome-api';
import {getInputValue, q, setInputValue} from '../utils/dom-functions';


function composeDataToSave() {
  const dataToSave: any = {};
  Object.keys(DEFAULT_SETTINGS).forEach(key => {
    dataToSave[key] = getInputValue(key);
  });

  return dataToSave;
}

function fillFormWithData(data: Partial<StorageDef>) {
  (Object.keys(data) as StorageKey[])
    .forEach((key: StorageKey) => {
      const value = data[key] || DEFAULT_SETTINGS[key];
      setInputValue(key, value);
    });
}

function saveOptions() {
  chrome.storage.sync.set(composeDataToSave(), () => {
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
