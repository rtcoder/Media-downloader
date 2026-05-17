import {FnArgs} from './common.type';
import {EventMsg} from './message-event-name.enum';

export type ChromeTab = chrome.tabs.Tab;

export type NullableChromeTab = ChromeTab | null;

export type NullableChromeTabAsync =  Promise<NullableChromeTab>;

export type ChromeTabChangeInfo = chrome.tabs.TabChangeInfo;

export type ChromeTabCreateProperties = chrome.tabs.CreateProperties;

export type ChromeMessageSender = chrome.runtime.MessageSender;

export type OpenChromePopupOptions = chrome.action.OpenPopupOptions;

export type ChromePopupDetails = chrome.action.PopupDetails;

export type OpenSidePanelOptions = chrome.sidePanel.OpenOptions;

export type SidePanelBehavior = chrome.sidePanel.PanelBehavior;

export type SidePanelOptions = chrome.sidePanel.PanelOptions;

export type ContextMenusCreateProperties = chrome.contextMenus.CreateProperties;

export type UpdateChromeTabCallback = (tabId: number, changeInfo: ChromeTabChangeInfo, tab: ChromeTab) => void;

export type CreateChromeTabCallback = (tab: ChromeTab) => void;

export type ReplaceChromeTabCallback = (addedTabId: number, removedTabId: number) => void;

export type ActivateChromeTabCallback = (activeInfo: chrome.tabs.TabActiveInfo) => void;

export type OnMessageCallback = (message: EventMsg, sender: ChromeMessageSender, sendResponse: FnArgs) => void;

export type ContextMenuClickCallback = (clickData: chrome.contextMenus.OnClickData, tab: ChromeTab) => void;

export type ClickExtensionIconCallback = (tab: ChromeTab) => void;

export type OnInstalledCallback = (details: chrome.runtime.InstalledDetails) => void;
