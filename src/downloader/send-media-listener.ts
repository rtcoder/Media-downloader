import {displayMedia} from '../media-display';
import {mediaInTabs} from '../media-in-tabs';
import {FoundMedia} from '../types/found-media.type';
import {MediaItem} from '../types/media-in-tabs.type';
import {getCurrentTab} from '../utils/chrome-api';
import {q} from '../utils/dom-functions';
import {getUuid} from '../utils/utils';
import {isRestrictedUrl} from '../utils/yt-restriction';
import {mediaTypes} from './media-types';
import {updateTabInfo} from './tab-info';


function updateMediaCount() {
  mediaTypes.forEach(type => {
    const count = mediaInTabs.filter(item => item.type === type).length;
    q(`.section-buttons button[data-section="${type}"] .items-count`).innerHTML = count.toString();
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

  updateTabInfo(currentTab);
  const tabUuid = getUuid(`${currentTab.id!}-${currentTab.url!}`);
  const restricted = isRestrictedUrl(currentTab.url!);

  if (restricted) {
    displayMedia();
    return;
  }
  const mapMedia = (item: MediaItem) => {
    item.tabId = currentTab.id!;
    item.tabUuid = tabUuid;
    item.itemIndex = `${currentTab.id!}-${tabUuid}-${item.uuid}`;
    return item;
  };
  const returnedMedia = [
    ...data.image.map(mapMedia),
    ...data.audio.map(mapMedia),
    ...data.video.map(mapMedia),
  ];
  returnedMedia.forEach(newItem => {
    const found = mediaInTabs.find(item => item.itemIndex === newItem.itemIndex);
    if (!found) {
      mediaInTabs.push(newItem);
    }
  });

  updateMediaCount();
  displayMedia();
}

