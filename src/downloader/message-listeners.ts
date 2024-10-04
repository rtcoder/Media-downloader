import {displayMedia, setTabExpanded} from '../media-display';
import {mediaInTabs, tabsInfo} from '../media-in-tabs';
import {ChromeTab} from '../types/chrome.type';
import {FoundMedia} from '../types/found-media.type';
import {MediaInfo, MediaItem} from '../types/media-in-tabs.type';
import {MessageEventNameEnum} from '../types/message-event-name.enum';
import {getCurrentTab, getTab, onMessage} from '../utils/chrome-api';
import {getUuid, uniqueSourceItems} from '../utils/utils';
import {isRestrictedUrl} from '../utils/yt-restriction';
import {findMedia} from './find-media';
import {mediaTypes} from './media-types';

function updateTabInfo(info: ChromeTab) {
  const tabUuid = getUuid(`${info.id!}-${info.url!}`);
  tabsInfo[tabUuid] = {
    id: info.id!,
    favIconUrl: info.favIconUrl!,
    url: info.url!,
    title: info.title!,
    isRestricted: isRestrictedUrl(info.url!),
    uuid: tabUuid,
  };
}

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

async function sendMediaListener(data: FoundMedia) {
  if (data.error && Object.keys(data.error).length > 0) {
    /// error
    console.log(data);
    return;
  }
  const currentTab = data.tabInfo || await getCurrentTab();
  if (!currentTab) {
    return;
  }

  const returnedMedia: MediaInfo = {
    image: data.image,
    audio: data.audio,
    video: data.video,
  };

  mediaTypes
    .filter(name => !!returnedMedia[name])
    .forEach(name => {
      const newMedia = {
        image: [],
        video: [],
        audio: [],
      } as MediaInfo;

      const restricted = isRestrictedUrl(currentTab.url!);
      if (!restricted) {
        returnedMedia[name]
          .filter((item: MediaItem) => !newMedia[name].includes(item))
          .forEach((item: MediaItem) => newMedia[name].push(item));
      }

      const tabUuid = getUuid(`${currentTab.id!}-${currentTab.url!}`);
      let existingIndexTabGroup = mediaInTabs.findIndex(({tabId}) => tabId === currentTab.id!);
      if (existingIndexTabGroup === -1) {
        mediaInTabs.push({
          tabId: currentTab.id!,
          elements: [],
        });
        existingIndexTabGroup = mediaInTabs.length - 1;
      }
      const existingIndex = mediaInTabs[existingIndexTabGroup].elements.findIndex(obj => obj.tabUuid === tabUuid);

      updateTabInfo(currentTab);

      if (existingIndex === -1) {
        mediaInTabs[existingIndexTabGroup].elements.push({
          media: newMedia,
          tabUuid,
        });
      } else {
        const {media} = mediaInTabs[existingIndexTabGroup].elements[existingIndex];
        mediaTypes.forEach((type: keyof MediaInfo) => {
          mediaInTabs[existingIndexTabGroup].elements[existingIndex].media[type] = uniqueSourceItems([
            ...media[type],
            ...newMedia[type],
          ]);
        });
      }
      mediaInTabs.forEach(group => {
        group.elements.forEach(info => setTabExpanded(info.tabUuid, false));
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
