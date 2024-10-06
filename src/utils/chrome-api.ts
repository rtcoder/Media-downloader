import {StorageDef} from '../storage/storage-def';
import {
  ActivateChromeTabCallback,
  ChromePopupDetails,
  ChromeTabCreateProperties,
  ClickExtensionIconCallback,
  ContextMenuClickCallback,
  ContextMenusCreateProperties,
  CreateChromeTabCallback,
  NullableChromeTabAsync,
  OnInstalledCallback,
  OnMessageCallback,
  OpenChromePopupOptions,
  OpenSidePanelOptions,
  ReplaceChromeTabCallback,
  SidePanelBehavior,
  SidePanelOptions,
  UpdateChromeTabCallback,
} from '../types/chrome.type';
import {Fn, FnArgs, NullableNumber, NullableString} from '../types/common.type';
import {MessageEventNameEnum} from '../types/message-event-name.enum';

export async function executeContentScript(scriptUrl: string, tabId: NullableNumber = null) {
  if (!tabId) {
    const tab = await getCurrentTab();
    if (!tab || !tab.id) {
      return;
    }
    if (tab.id <= 0) {
      return;
    }
    tabId = tab.id!;
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

    if (!tab?.url || tab?.url?.startsWith('chrome://') || tab?.url?.startsWith('https://chromewebstore.google.com')) {
      return null;
    }

    return tab;
  } catch {
    return null;
  }
}

export async function getTab(tabId: number): NullableChromeTabAsync {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (chrome.runtime.lastError) {
      console.error('Error get tab by ID:', chrome.runtime.lastError);
      return null;
    }
    if (!tab?.url || tab?.url?.startsWith('chrome://') || tab?.url?.startsWith('https://chromewebstore.google.com')) {
      return null;
    }
    return tab;
  } catch {
    return null;
  }
}

export function downloadUrl(url: string, filename: NullableString = null) {
  const downloadOptions: chrome.downloads.DownloadOptions = {url};
  if (filename) {
    downloadOptions.filename = filename;
  }
  chrome.downloads.download(downloadOptions);
}

export function getStorageValue(obj: Partial<StorageDef>, callback: (result: Partial<StorageDef>) => void) {
  chrome.storage.sync.get(obj, callback);
}

export function setStorageValue(obj: Partial<StorageDef>, callback?: Fn) {
  if (callback) {
    chrome.storage.sync.set(obj, callback);
  } else {
    chrome.storage.sync.set(obj);
  }
}

export function sendMessage(eventName: MessageEventNameEnum, data: any = null, callback?: FnArgs) {
  if (!callback) {
    callback = (response) => {
    };
  }
  try {
    chrome.runtime.sendMessage({eventName, data}, callback);
  } catch {
    // do nothing
  }
}

export function onMessage(callback: OnMessageCallback) {
  chrome.runtime.onMessage.addListener(callback);
}

export function createTab(details: ChromeTabCreateProperties) {
  chrome.tabs.create(details);
}

export function setPopupOptions(options: ChromePopupDetails): void {
  chrome.action.setPopup(options);
}

export function setSidePanelOptions(options: SidePanelOptions): void {
  chrome.sidePanel.setOptions(options);
}

export function setSidePanelBehavior(options: SidePanelBehavior): void {
  chrome.sidePanel.setPanelBehavior(options).catch((error) => console.log(error));
}

export function contextMenuClicked(callback: ContextMenuClickCallback) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab) {
      return;
    }
    callback(info, tab);
  });
}

export function onInstalled(callback: OnInstalledCallback) {
  chrome.runtime.onInstalled.addListener(callback);
}

export function createContextMenu(properties: ContextMenusCreateProperties) {
  chrome.contextMenus.create(properties);
}

export function onCreateTab(callback: CreateChromeTabCallback) {
  chrome.tabs.onCreated.addListener(callback);
}

export function onReplaceTab(callback: ReplaceChromeTabCallback) {
  chrome.tabs.onReplaced.addListener(callback);
}

export function onActivateTab(callback: ActivateChromeTabCallback) {
  chrome.tabs.onActivated.addListener(callback);
}

export function onUpdateTab(callback: UpdateChromeTabCallback) {
  chrome.tabs.onUpdated.addListener(callback);
}

export function onClickExtensionIcon(callback: ClickExtensionIconCallback) {
  chrome.action.onClicked.addListener(callback);
}

export function openPopup(options?: OpenChromePopupOptions) {
  chrome.action.openPopup(options);
}

export function openSidePanel(options: OpenSidePanelOptions) {
  chrome.sidePanel.open(options);
}

export function getVersion(): string {
  return chrome.runtime.getManifest().version;
}
