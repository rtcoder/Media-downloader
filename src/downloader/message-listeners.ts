import {displayMedia, setTabExpanded} from '../media-display';
import {mediaInTabs} from '../media-in-tabs';
import {MediaInfo, MediaItem, TabData} from '../types/media-display.type';
import {MessageEventNameEnum} from '../types/message-event-name.enum';
import {getCurrentTab, getTab, onMessage} from '../utils/chrome-api';
import {getUuid, uniqueSourceItems} from '../utils/utils';
import {isRestrictedUrl} from '../utils/yt-restriction';
import {findMedia} from './find-media';
import {mediaTypes} from './media-types';

function tabCreatedListener(tab: chrome.tabs.Tab) {
  if (tab.active) {
    findMedia(tab.id);
  }
}

function tabUpdatedListener(tabId: number, changeInfo: any, tab: chrome.tabs.Tab) {
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

async function sendMediaListener(data: any) {
  if (data.error && Object.keys(data.error).length > 0) {
    /// error
    console.log(data);
    return;
  }
  const tabInfo = await getCurrentTab();
  if (!tabInfo) {
    return;
  }

  mediaTypes
    .filter(name => !!data[name])
    .forEach(name => {
      const newMedia = {
        image: [],
        video: [],
        audio: [],
      } as MediaInfo;

      data[name]
        .filter((item: MediaItem) => !newMedia[name].includes(item));

      const restricted = isRestrictedUrl(tabInfo.url!);
      if (!restricted) {
        data[name].forEach((item: MediaItem) => newMedia[name].push(item));
      }

      const tabUuid = getUuid(`${tabInfo.id!}-${tabInfo.url!}`);
      let existingIndexTabGroup = mediaInTabs.findIndex(({tabId}) => tabId === tabInfo.id!);
      if (existingIndexTabGroup === -1) {
        mediaInTabs.push({
          tabId: tabInfo.id!,
          elements: [],
        });
        existingIndexTabGroup = mediaInTabs.length - 1;
      }
      const existingIndex = mediaInTabs[existingIndexTabGroup].elements.findIndex(({tab}) => tab.uuid === tabUuid);
      const tabObj: TabData = {
        id: tabInfo.id!,
        favIconUrl: tabInfo.favIconUrl!,
        url: tabInfo.url!,
        title: tabInfo.title!,
        isRestricted: restricted,
        uuid: tabUuid,
      };

      if (existingIndex === -1) {
        mediaInTabs[existingIndexTabGroup].elements.push({
          media: newMedia,
          tab: tabObj,
        });
      } else {
        const {media} = mediaInTabs[existingIndexTabGroup].elements[existingIndex];
        mediaTypes.forEach((type: keyof MediaInfo) => {
          mediaInTabs[existingIndexTabGroup].elements[existingIndex].media[type] = uniqueSourceItems([
            ...media[type],
            ...newMedia[type],
          ]);
          mediaInTabs[existingIndexTabGroup].elements[existingIndex].tab = tabObj;
        });
      }
      mediaInTabs.forEach(group => {
        group.elements.forEach(info => setTabExpanded(info.tab.uuid, false));
      });
      setTabExpanded(tabUuid, true);
    });

  displayMedia();
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
