import {displayMedia, getAllMediaToDisplay, setTabExpanded} from '../media-display';
import {mediaInTabs} from '../media-in-tabs';
import {MediaInfo, MediaItem, VideoItem} from '../types/media-display.type';
import {MessageEventNameEnum} from '../types/message-event-name.enum';
import {executeContentScript, getCurrentTab, onMessage} from '../utils/chrome-api';
import {hide, q, setDisabled, show, toggleClass} from '../utils/dom-functions';
import {downloadImages, downloadItem} from '../utils/download-functions';
import {_dispatchEvent, mapMediaTypeToSectionName, uniqueSourceItems} from '../utils/utils';

const mediaTypes: (keyof MediaInfo)[] = ['images', 'audios', 'videos'];
const restrictedUrls = [
  'https://youtube.com',
  'https://www.youtube.com',
];

function isRestrictedUrl(url: string) {
  return restrictedUrls.some(restrictedUrl => url.includes(restrictedUrl));
}

onMessage((message, sender, sendResponse) => {
  const {eventName, data} = message;
  console.log(eventName, data);
  switch (eventName) {
    case MessageEventNameEnum.TAB_UPDATED:
      onTabUpdated(data.tabId, data.changeInfo, data.tab);
      break;
    case MessageEventNameEnum.TAB_ACTIVATED:
    case MessageEventNameEnum.TAB_CREATED:
    case MessageEventNameEnum.TAB_REPLACED:
      const {tabId, changeInfo, tab} = data;
      onTabUpdated(tabId, changeInfo, tab);
      break;
    case MessageEventNameEnum.SEND_MEDIA:
      onSendMedia(data);
      break;
  }
});

async function onTabUpdated(tabId: number, changeInfo: any, tab: chrome.tabs.Tab | null = null) {
  if (!tab) {
    tab = await getCurrentTab();
  }
  if (!tab) {
    return;
  }
  if (tab?.url?.startsWith('chrome://')) {
    return;
  }

  if (tab.active && changeInfo.status === 'complete') {
    findMedia();
  }
}

async function onSendMedia(data: any) {
  if (data.error && Object.keys(data.error).length > 0) {
    /// error
    console.log(data);
    return;
  }
  const tabInfo = await getCurrentTab();
  if (!tabInfo) {
    return;
  }

  hide('.yt-info');
  if (isRestrictedUrl(tabInfo.url!)) {
    show('.yt-info');
    return;
  }
  mediaTypes
    .filter(name => !!data[name])
    .forEach(name => {
      const newMedia = {
        images: [],
        videos: [],
        audios: [],
      } as MediaInfo;

      data[name]
        .filter((item: MediaItem & VideoItem) => !newMedia[name].includes(item))
        .forEach((item: MediaItem & VideoItem) => newMedia[name].push(item));

      const {id, favIconUrl, url, title} = tabInfo;
      const existingIndex = mediaInTabs.findIndex(({tab}) => tab.id === id);
      const tabObj = {id: id!, favIconUrl: favIconUrl!, url: url!, title: title!};
      if (existingIndex === -1) {
        mediaInTabs.push({
          media: newMedia,
          tab: tabObj,
        });
      } else {
        const {media} = mediaInTabs[existingIndex];
        mediaTypes.forEach((type: keyof MediaInfo) => {
          mediaInTabs[existingIndex].media[type] = uniqueSourceItems([
            ...media[type],
            ...newMedia[type],
          ]);
          mediaInTabs[existingIndex].tab = tabObj;
        });
      }
      mediaInTabs.forEach(info => setTabExpanded(info.tab.id, false));
      setTabExpanded(id!, true);
    });

  displayMedia();
}

function changeToggleAllCheckbox(e: any) {
  const {checked} = e.target;

  let allAreChecked = true;
  let allAreUnchecked = true;
  const mediaToDisplay = getAllMediaToDisplay();
  let selectedCount = 0;

  toggleClass('.grid-item','checked', checked);

  for (let i = 0; i < mediaToDisplay.length; i++) {
    const {items} = mediaToDisplay[i];
    for (let idx = 0; idx < items.length; idx++) {
      items[idx].selected = checked;
      if (items[idx].selected) {
        allAreUnchecked = false;
        selectedCount++;
      } else {
        allAreChecked = false;
      }
    }
  }

  updateSelectedCountText(selectedCount);

  const toggle_all_checkbox = q('#toggle_all_checkbox') as HTMLInputElement;
  toggle_all_checkbox.indeterminate = !(allAreChecked || allAreUnchecked);
  if (allAreChecked) {
    toggle_all_checkbox.checked = true;
  } else if (allAreUnchecked) {
    toggle_all_checkbox.checked = false;
  }
}

function onClickItem(target: any) {
  const gridItem = target.closest('.grid-item');
  const itemIndex = gridItem.getAttribute('data-item-idx');
  const type = gridItem.getAttribute('data-type');
  const isChecked = gridItem.classList.contains('checked');
  const newValue = !isChecked;
  toggleClass(gridItem, 'checked');

  const [tabId, itemIdx] = itemIndex.split('-').map((item: string) => +item);
  const currentSection = mapMediaTypeToSectionName(type);
  const tabIndexInSection = mediaInTabs.findIndex(({tab}) => tab.id === tabId);
  if (tabIndexInSection === -1) {
    return;
  }
  mediaInTabs[tabIndexInSection].media[currentSection][itemIdx].selected = newValue;

  let allAreChecked = true;
  let allAreUnchecked = true;
  const mediaToDisplay = getAllMediaToDisplay();
  let selectedCount = 0;
  console.log(itemIndex, newValue);
  for (let i = 0; i < mediaToDisplay.length; i++) {
    const {items} = mediaToDisplay[i];
    for (let idx = 0; idx < items.length; idx++) {
      if (items[idx].selected) {
        allAreUnchecked = false;
        selectedCount++;
      } else {
        allAreChecked = false;
      }
    }
  }

  updateSelectedCountText(selectedCount);

  const toggle_all_checkbox = q('#toggle_all_checkbox') as HTMLInputElement;
  toggle_all_checkbox.indeterminate = !(allAreChecked || allAreUnchecked);
  if (allAreChecked) {
    toggle_all_checkbox.checked = true;
  } else if (allAreUnchecked) {
    toggle_all_checkbox.checked = false;
  }
}

function updateSelectedCountText(selectedCount: number) {
  q('#download-btn .selected-count')!.innerHTML = selectedCount > 0
    ? `(${selectedCount})`
    : '';

  setDisabled('#download-btn', !selectedCount);
}

function selectSection(name: keyof MediaInfo) {
  name = mediaTypes.includes(name) ? name : 'images';
  toggleClass('.section-buttons button', 'selected', false);
  toggleClass(
    `.section-buttons button[data-section="${name}"]`,
    'selected',
    true,
  );
}


function setListeners() {
  document.body.addEventListener('click', e => {
    const {target}: { target: any } = e;
    if (!target) {
      return;
    }
    if (target.closest('#download-btn')) {
      downloadImages(getAllMediaToDisplay());
      return;
    }

    if (target.closest('.section-buttons button')) {
      selectSection(target.closest('.section-buttons button').getAttribute('data-section'));
      displayMedia();
      return;
    }

    if (target.matches('.thumbnail')) {
      onClickItem(target);
      return;
    }

    if (target.matches('.accordion-header') || target.closest('.accordion-button')) {
      const accordionItem = target.closest('.accordion-item');
      accordionItem.classList.toggle('active');
      return;
    }

    if (target.matches('.yt-info a')) {
      window.open('https://developer.chrome.com/docs/webstore/troubleshooting/#prohibited-products');
      return;
    }

    if (target.matches('.download_image_button')) {
      const gridItem = target.closest('.grid-item');
      const url = gridItem.getAttribute('data-src-dw');
      const alt = gridItem.getAttribute('data-filename');
      downloadItem({
        url,
        alt: alt?.length ? alt : null,
      });
    }
  });

  q('#toggle_all_checkbox')!.addEventListener('change', changeToggleAllCheckbox);
}

function findMedia() {
  executeContentScript('/dist/content-script/send_media.bundle.js');
}

function init() {
  findMedia();
  setListeners();
}

init();
