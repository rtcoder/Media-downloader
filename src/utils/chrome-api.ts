import {StorageDef} from '../storage/storage-def';
import {EventMsg, MessageEventNameEnum} from '../types/message-event-name.enum';

export async function executeContentScript(scriptUrl: string, tabId: number | null = null) {
  if (!tabId) {
    const tab = await getCurrentTab();
    if (!tab || !tab.id) {
      return;
    }
    if (tab.id <= 0) {
      return;
    }
    tabId = tab.id;
  }

  await chrome.scripting.executeScript({
    target: {tabId, allFrames: true},
    files: [scriptUrl],
  });
}

export async function getCurrentTab() {
  try {
    let queryOptions = {active: true, lastFocusedWindow: true};
    let [tab] = await chrome.tabs.query(queryOptions);

    console.log('current tabUrl: ', tab?.url, tab);
    if (!tab?.url || tab?.url?.startsWith('chrome://') || tab?.url?.startsWith('https://chromewebstore.google.com')) {
      return null;
    }

    return tab;
  } catch {
    return null;
  }
}

export async function getTab(tabId: number): Promise<chrome.tabs.Tab | null> {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (chrome.runtime.lastError) {
      console.error('Error get tab by ID:', chrome.runtime.lastError);
      return null;
    }
    console.log('tabUrl: ', tab?.url);
    if (!tab?.url || tab?.url?.startsWith('chrome://') || tab?.url?.startsWith('https://chromewebstore.google.com')) {
      return null;
    }
    return tab;
  } catch {
    return null;
  }
}

export function downloadUrl(url: string, filename: string | null = null) {
  const downloadOptions: chrome.downloads.DownloadOptions = {url};
  if (filename) {
    downloadOptions.filename = filename;
  }
  chrome.downloads.download(downloadOptions);
}

export function getStorageValue(obj: Partial<StorageDef>, callback: (result: Partial<StorageDef>) => void) {
  chrome.storage.sync.get(obj, callback);
}

export function setStorageValue(obj: Partial<StorageDef>, callback?: () => void) {
  if (callback) {
    chrome.storage.sync.set(obj, callback);
  } else {
    chrome.storage.sync.set(obj);
  }
}

export function sendMessage(eventName: MessageEventNameEnum, data: any) {
  try {
    chrome.runtime.sendMessage({eventName, data}, (response) => {
    });
  } catch {
    // do nothing
  }
}

export function onMessage(callback: (message: EventMsg, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => void) {
  chrome.runtime.onMessage.addListener(callback);
}

export function createTab(details: chrome.tabs.CreateProperties) {
  chrome.tabs.create(details);
}

export function setPopupOptions(options: chrome.action.PopupDetails): void {
  chrome.action.setPopup(options);
}

export function setSidePanelOptions(options: chrome.sidePanel.PanelOptions): void {
  chrome.sidePanel.setOptions(options);
}

export function setSidePanelBehavior(options: chrome.sidePanel.PanelBehavior): void {
  chrome.sidePanel.setPanelBehavior(options).catch((error) => console.log(error));
}

export function contextMenuClicked(callback: (clickData: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => void) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab) {
      return;
    }
    callback(info, tab);
  });
}

export function onInstalled(callback: (details: chrome.runtime.InstalledDetails) => void) {
  chrome.runtime.onInstalled.addListener(callback);
}

export function createContextMenu(properties: chrome.contextMenus.CreateProperties) {
  chrome.contextMenus.create(properties);
}

export function onCreateTab(callback: (tab: chrome.tabs.Tab) => void) {
  chrome.tabs.onCreated.addListener(callback);
}

export function onReplaceTab(callback: (addedTabId: number, removedTabId: number) => void) {
  chrome.tabs.onReplaced.addListener(callback);
}

export function onActivateTab(callback: (activeInfo: chrome.tabs.TabActiveInfo) => void) {
  chrome.tabs.onActivated.addListener(callback);
}

export function onUpdateTab(callback: (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => void) {
  chrome.tabs.onUpdated.addListener(callback);
}

export function onClickExtensionIcon(callback: (tab: chrome.tabs.Tab) => void) {
  chrome.action.onClicked.addListener(callback);
}

export function openPopup(options?: chrome.action.OpenPopupOptions) {
  chrome.action.openPopup(options);
}

export function openSidePanel(options: chrome.sidePanel.OpenOptions) {
  chrome.sidePanel.open(options);
}

export function getVersion(): string {
  return chrome.runtime.getManifest().version;
}
