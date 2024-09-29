import {DefaultActionType} from '../storage/storage-def';
import {getStorageDefaultActionValue, getStoragePreviousVersionValue} from '../storage/storage-fn';
import {MessageEventNameEnum} from '../types/message-event-name.enum';
import {
  contextMenuClicked,
  createContextMenu,
  createTab,
  onActivateTab,
  onClickExtensionIcon,
  onCreateTab,
  onInstalled,
  onReplaceTab,
  onUpdateTab,
  openPopup,
  openSidePanel,
  sendMessage,
  setPopupOptions,
  setSidePanelBehavior,
  setSidePanelOptions,
  setStorageValue,
} from '../utils/chrome-api';

function handleUpdate(details: chrome.runtime.InstalledDetails) {
  if (details.reason !== 'update') {
    return;
  }
  const currentVersion = chrome.runtime.getManifest().version;
  getStoragePreviousVersionValue((previousVersion) => {
    if (previousVersion !== currentVersion) {
      const CHANGES_URL = 'views/changelog.html';
      createTab({url: CHANGES_URL});
    }

    setStorageValue({previousVersion: currentVersion});
  });
}

function openDownloader(tab: chrome.tabs.Tab) {
  getStorageDefaultActionValue((defaultAction) => {
    switch (defaultAction) {
      case DefaultActionType.POPUP:
        openPopup();
        break;
      case DefaultActionType.SIDE_PANEL:
        openSidePanel({windowId: tab.windowId});
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

onUpdateTab((tabId, changeInfo, tab) => {
  updateSidePanelAndPopupBehavior();

  sendMessage(MessageEventNameEnum.TAB_UPDATED, {tabId, changeInfo, tab});
});

onActivateTab((activeInfo) => {
  updateSidePanelAndPopupBehavior();

  sendMessage(MessageEventNameEnum.TAB_ACTIVATED, {tabId: activeInfo.tabId});
});

onReplaceTab((addedTabId) => {
  updateSidePanelAndPopupBehavior();

  sendMessage(MessageEventNameEnum.TAB_REPLACED, {tabId: addedTabId});
});

onCreateTab((tab) => {
  updateSidePanelAndPopupBehavior();

  sendMessage(MessageEventNameEnum.TAB_CREATED, {tab});
});

onClickExtensionIcon((tab) => {
  updateSidePanelAndPopupBehavior();
  openDownloader(tab);
});

onInstalled(details => {
  updateSidePanelAndPopupBehavior();

  createContextMenu({
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
