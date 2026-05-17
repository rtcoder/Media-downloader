import {tabCollections, tabsInfo} from '../media-in-tabs';
import {ChromeTab} from '../types/chrome.type';
import {getUuid} from '../utils/utils';
import {isRestrictedUrl} from '../utils/yt-restriction';

export function updateTabInfo(tab: ChromeTab) {
  const tabId = tab.id!;
  const tabUuid = getUuid(`${tabId}-${tab.url!}`);
  tabsInfo[tabUuid] = {
    id: tabId,
    favIconUrl: tab.favIconUrl!,
    url: tab.url!,
    title: tab.title!,
    isRestricted: isRestrictedUrl(tab.url!),
    uuid: tabUuid,
  };
  if (!tabCollections.includes(tabId)) {
    tabCollections.push(tabId);
  }
}
