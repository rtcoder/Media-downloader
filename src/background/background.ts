import {findMediaQuickToDownload} from '../downloader/find-media';
import {DefaultActionType} from '../storage/storage-def';
import {getStorageDefaultActionValue, getStoragePreviousVersionValue} from '../storage/storage-fn';
import {ChromeTab} from '../types/chrome.type';
import {QuickMediaItem} from '../types/media-in-tabs.type';
import {MessageEventNameEnum} from '../types/message-event-name.enum';
import {
  contextMenuClicked,
  createContextMenu,
  downloadUrl,
  getTab,
  getVersion,
  onActivateTab,
  onClickExtensionIcon,
  onCreateTab,
  onInstalled,
  onMessage,
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
import {downloadImages} from '../utils/download-functions';

function handleUpdate(details: chrome.runtime.InstalledDetails) {
  if (details.reason !== 'update') {
    return;
  }
  const currentVersion = getVersion();
  getStoragePreviousVersionValue((previousVersion) => {
    if (previousVersion !== currentVersion) {
      setStorageValue({showChangelogLink: true});
    }

    setStorageValue({previousVersion: currentVersion});
  });
}

function openDownloader(tab: ChromeTab) {
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
    id: 'downloadAllMedia',
    title: 'Download all media',
    contexts: ['page'],
  });
  createContextMenu({
    id: 'quickDownloadImage',
    title: 'Quick download',
    contexts: ['image'],
  });
  handleUpdate(details);
});

contextMenuClicked((info, tab) => {
  if (info.menuItemId === 'downloadAllMedia') {
    findMediaQuickToDownload(tab.id);
    return;
  }
  if (info.menuItemId === 'quickDownloadImage' && info.srcUrl) {
    downloadUrl(info.srcUrl);
  }
});
onMessage((message, sender, sendResponse) => {
  if (!sender.tab?.id) {
    sendResponse(null);
    return;
  }
  if (message.eventName === MessageEventNameEnum.GET_TAB_INFO) {
    getTab(sender.tab.id).then(sendResponse);

    return true;
  }
  if (message.eventName === MessageEventNameEnum.QUICK_SEND_MEDIA_FOR_DOWNLOAD) {
    const media = message.data.media as QuickMediaItem[];
    downloadImages(media);
    sendResponse(null);
    return;
  }
});
