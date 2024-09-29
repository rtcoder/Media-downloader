import {StorageDef} from '../storage/storage-def';
import {EventMsg, MessageEventNameEnum} from '../types/message-event-name.enum';


/**
 * Executes a content script on the current active tab in all frames.
 *
 * This function retrieves the current active tab and, if the tab is available,
 * executes the specified content script file across all frames in that tab using the Chrome Scripting API.
 *
 * @param {string} scriptUrl - The URL or file path of the content script to execute.
 * @returns {Promise<void>} A promise that resolves once the script has been executed or exits early if no tab is found.
 */
export async function executeContentScript(scriptUrl: string) {
  const tab = await getCurrentTab();
  if (!tab || !tab.id) {
    return;
  }
  if (tab.id <= 0) {
    return;
  }

  await chrome.scripting.executeScript({
    target: {tabId: tab.id, allFrames: true},
    files: [scriptUrl],
  } as any);
}

/**
 * Function that returns information about a browser tab or undefined.
 *
 * @returns {chrome.tabs.QueryInfo|null} An object containing tab information, or null if the tab does not exist or the data cannot be retrieved.
 */
export async function getCurrentTab() {
  let queryOptions = {active: true, lastFocusedWindow: true};
  let [tab] = await chrome.tabs.query(queryOptions);

  if (tab?.url?.startsWith('chrome://')) {
    return null;
  }

  return tab;
}

/**
 * Initiates the download of a file from the provided URL using the Chrome downloads API.
 *
 * This function triggers a download for the specified URL using `chrome.downloads.download`.
 *
 * @param {string} url - The URL of the file to be downloaded.
 * @param {string|null} filename - The URL of the file to be downloaded.
 */
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
