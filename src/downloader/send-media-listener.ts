import {displayMedia, setTabExpanded} from '../media-display';
import {mediaInTabs, tabsInfo} from '../media-in-tabs';
import {ChromeTab} from '../types/chrome.type';
import {FoundMedia} from '../types/found-media.type';
import {MediaInfo, MediaItem} from '../types/media-in-tabs.type';
import {getCurrentTab} from '../utils/chrome-api';
import {q} from '../utils/dom-functions';
import {getUuid, uniqueSourceItems} from '../utils/utils';
import {isRestrictedUrl} from '../utils/yt-restriction';
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

function getExistingIndexTabGroup(tabId: number): number {
  let existingIndexTabGroup = mediaInTabs.findIndex(({tabId}) => tabId === tabId!);
  if (existingIndexTabGroup === -1) {
    mediaInTabs.push({
      tabId,
      elements: [],
    });
    existingIndexTabGroup = mediaInTabs.length - 1;
  }
  return existingIndexTabGroup;
}

function getExistingTabIndexInGroup(tabUuid: string, existingIndexTabGroup: number): number {
  let existingIndex = mediaInTabs[existingIndexTabGroup].elements.findIndex(obj => obj.tabUuid === tabUuid);
  if (existingIndex === -1) {
    mediaInTabs[existingIndexTabGroup].elements.push({
      media: {
        image: [],
        video: [],
        audio: [],
      } as MediaInfo,
      tabUuid,
    });
    existingIndex = mediaInTabs[existingIndexTabGroup].elements.length - 1;
  }
  return existingIndex;
}

function updateMediaCount() {
  let countData = {
    image: 0,
    audio: 0,
    video: 0,
  };
  mediaInTabs.forEach(group => {
    group.elements.forEach(info => {
      setTabExpanded(info.tabUuid, false);
      mediaTypes.forEach(type => {
        countData[type] += info.media[type].length;
      });
    });
  });

  mediaTypes.forEach(type => {
    q(`.section-buttons button[data-section="${type}"] .items-count`).innerHTML = countData[type].toString();
  });
}

export async function sendMediaListener(data: FoundMedia) {
  if (data.error && Object.keys(data.error).length > 0) {
    /// error
    console.log(data);
    return;
  }
  const currentTab = data.tabInfo || await getCurrentTab();
  if (!currentTab) {
    return;
  }

  const newMedia = {
    image: [],
    video: [],
    audio: [],
  } as MediaInfo;

  updateTabInfo(currentTab);
  const tabUuid = getUuid(`${currentTab.id!}-${currentTab.url!}`);
  const restricted = isRestrictedUrl(currentTab.url!);

  let existingIndexTabGroup = getExistingIndexTabGroup(currentTab.id!);
  const existingIndex = getExistingTabIndexInGroup(tabUuid, existingIndexTabGroup);
  const {media} = mediaInTabs[existingIndexTabGroup].elements[existingIndex];

  if (restricted) {
    displayMedia();
    return;
  }

  const returnedMedia: MediaInfo = {
    image: data.image,
    audio: data.audio,
    video: data.video,
  };
  mediaTypes
    .filter(type => !!returnedMedia[type])
    .forEach(type => {
      returnedMedia[type]
        .forEach((item: MediaItem) => newMedia[type].push(item));
      mediaInTabs[existingIndexTabGroup].elements[existingIndex].media[type] = uniqueSourceItems([
        ...media[type],
        ...newMedia[type],
      ]);
    });

  updateMediaCount();
  setTabExpanded(tabUuid, true);
  displayMedia();
}

