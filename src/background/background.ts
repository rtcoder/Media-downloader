import {DefaultActionType} from '../storage/storage-def';
import {getStorageDefaultActionValue, getStoragePreviousVersionValue} from '../storage/storage-fn';
import {MessageEventNameEnum} from '../types/message-event-name.enum';
import {
  contextMenuClicked,
  createTab,
  sendMessage,
  setPopupOptions,
  setSidePanelBehavior,
  setSidePanelOptions,
} from '../utils/chrome-api';

const CHANGES_URL = 'views/changelog.html'; // Link do strony z changelogiem

/**
 *
 * @param {InstalledDetails} details
 */
function handleUpdate(details: chrome.runtime.InstalledDetails) {
  if (details.reason === 'update') {
    const currentVersion = chrome.runtime.getManifest().version;
    getStoragePreviousVersionValue((previousVersion) => {
      if (previousVersion !== currentVersion) {
        createTab({url: CHANGES_URL});
      }

      chrome.storage.sync.set({previousVersion: currentVersion});
    });
  }
}

function openDownloader(tab: chrome.tabs.Tab) {
  getStorageDefaultActionValue((defaultAction) => {
    switch (defaultAction) {
      case DefaultActionType.POPUP:
        chrome.action.openPopup();
        break;
      case DefaultActionType.SIDE_PANEL:
        chrome.sidePanel.open({windowId: tab.windowId});
        break;
    }
  });
}

function updateSidePanelAndPopupBehavior() {
  const downloaderPath = '/views/downloader.html';

  getStorageDefaultActionValue((defaultAction) => {
    const isSidePanel = defaultAction === DefaultActionType.SIDE_PANEL;
    const isPopup = defaultAction === DefaultActionType.POPUP;

    const downloaderPathForPopup = isPopup
      ? downloaderPath
      : '';
    const downloaderPathForSidePanel = isSidePanel
      ? downloaderPath
      : '';

    setSidePanelBehavior({openPanelOnActionClick: isSidePanel});
    setSidePanelOptions({path: downloaderPathForSidePanel});
    setPopupOptions({popup: downloaderPathForPopup});
  });
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  updateSidePanelAndPopupBehavior();

  sendMessage(MessageEventNameEnum.TAB_UPDATED, {tabId, changeInfo, tab});
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  updateSidePanelAndPopupBehavior();

  sendMessage(MessageEventNameEnum.TAB_ACTIVATED, {tabId: activeInfo.tabId});
});

chrome.tabs.onReplaced.addListener((addedTabId) => {
  updateSidePanelAndPopupBehavior();

  sendMessage(MessageEventNameEnum.TAB_REPLACED, {tabId: addedTabId});
});

chrome.tabs.onCreated.addListener((tabId) => {
  updateSidePanelAndPopupBehavior();

  sendMessage(MessageEventNameEnum.TAB_CREATED, {tabId});
});

chrome.action.onClicked.addListener((tab) => {
  updateSidePanelAndPopupBehavior();
  openDownloader(tab);
});

chrome.runtime.onInstalled.addListener(details => {
  updateSidePanelAndPopupBehavior();

  chrome.contextMenus.create({
    id: 'openMediaDownloader',
    title: 'Media Downloader',
    contexts: ['all'],
  });
  handleUpdate(details);
});

contextMenuClicked((info, tab) => {
  if (info.menuItemId === 'openMediaDownloader') {
    openDownloader(tab);
  }
});
