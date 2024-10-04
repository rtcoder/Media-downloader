import {ChromeTab} from '../types/chrome.type';
import {MessageEventNameEnum} from '../types/message-event-name.enum';
import {getTab, onMessage} from '../utils/chrome-api';
import {findMedia} from './find-media';
import {sendMediaListener} from './send-media-listener';


function tabCreatedListener(tab: ChromeTab) {
  if (tab.active) {
    findMedia(tab.id);
  }
}

function tabUpdatedListener(tabId: number, changeInfo: any, tab: ChromeTab) {
  if (tab.active && changeInfo.status === 'complete') {
    findMedia(tab.id);
  }
}

async function tabReplacedListener(tabId: number) {
  const tab = await getTab(tabId);
  if (!tab) {
    return;
  }

  if (tab.active) {
    findMedia(tabId);
  }
}

async function tabActivatedListener(tabId: number) {
  const tab = await getTab(tabId);
  if (!tab) {
    return;
  }

  if (tab.active) {
    findMedia(tabId);
  }
}

export function setMessageListeners(): void {
  onMessage((message) => {
    const {eventName, data} = message;
    console.log(eventName, data);
    switch (eventName) {
      case MessageEventNameEnum.TAB_UPDATED:
        tabUpdatedListener(data.tabId, data.changeInfo, data.tab);
        break;
      case MessageEventNameEnum.TAB_ACTIVATED:
        tabActivatedListener(data.tabId);
        break;
      case MessageEventNameEnum.TAB_CREATED:
        tabCreatedListener(data.tab);
        break;
      case MessageEventNameEnum.TAB_REPLACED:
        tabReplacedListener(data.tabId);
        break;
      case MessageEventNameEnum.SEND_MEDIA:
        sendMediaListener(data);
        break;
    }
  });
}
