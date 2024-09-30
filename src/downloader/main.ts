import {displayMedia, getAllMediaToDisplay, setTabExpanded} from '../media-display';
import {mediaInTabs} from '../media-in-tabs';
import {MediaInfo, MediaItem, TabData} from '../types/media-display.type';
import {MessageEventNameEnum} from '../types/message-event-name.enum';
import {executeContentScript, getCurrentTab, onMessage} from '../utils/chrome-api';
import {q, setDisabled, toggleClass} from '../utils/dom-functions';
import {downloadImages, downloadItem} from '../utils/download-functions';
import {getUuid, mapMediaTypeToSectionName, uniqueSourceItems} from '../utils/utils';
import {isRestrictedUrl} from '../utils/yt-restriction';

const mediaTypes: (keyof MediaInfo)[] = ['image', 'audio', 'video'];

onMessage((message) => {
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

function changeToggleAllCheckbox(e: any) {
  const {checked} = e.target;

  let allAreChecked = true;
  let allAreUnchecked = true;
  const mediaToDisplay = getAllMediaToDisplay();
  let selectedCount = 0;

  toggleClass('.grid-item', 'checked', checked);

  for (let i = 0; i < mediaToDisplay.length; i++) {
    const {data} = mediaToDisplay[i];
    for (let idx = 0; idx < data.length; idx++) {
    const {items} = data[idx];
    for (let _idx = 0; _idx < items.length; _idx++) {
      items[_idx].selected = checked;
      if (items[_idx].selected) {
        allAreUnchecked = false;
        selectedCount++;
      } else {
        allAreChecked = false;
      }
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

  const [tab_id, tabUuid, itemIdx] = itemIndex.split('-');
  const currentSection = mapMediaTypeToSectionName(type);
  const groupIndexInSection = mediaInTabs.findIndex(({tabId}) => tabId === +tab_id);
  const tabIndexInSection = mediaInTabs[groupIndexInSection].elements.findIndex(({tab}) => tab.uuid === tabUuid);
  if (tabIndexInSection === -1) {
    return;
  }
  mediaInTabs[groupIndexInSection].elements[tabIndexInSection].media[currentSection][+itemIdx].selected = newValue;

  let allAreChecked = true;
  let allAreUnchecked = true;
  const mediaToDisplay = getAllMediaToDisplay();
  let selectedCount = 0;
  console.log(itemIndex, newValue);
  for (let i = 0; i < mediaToDisplay.length; i++) {
    const {data} = mediaToDisplay[i];
    for (let idx = 0; idx < data.length; idx++) {
      const {items} = data[idx];
      for (let _idx = 0; _idx < items.length; _idx++) {
        if (items[_idx].selected) {
          allAreUnchecked = false;
          selectedCount++;
        } else {
          allAreChecked = false;
        }
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
  name = mediaTypes.includes(name) ? name : 'image';
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
      return;
    }

    if (target.closest('.accordion-header')) {
      const header = target.closest('.accordion-header');
      toggleClass(header.closest('.accordion-item'), 'active');
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
