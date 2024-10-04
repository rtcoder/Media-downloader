import {displayMedia, getAllMediaToDisplay} from '../media-display';
import {mediaInTabs} from '../media-in-tabs';
import {MediaInfoKey, MediaInfoKeyEnum} from '../types/media-in-tabs.type';
import {createTab, setStorageValue} from '../utils/chrome-api';
import {hide, q, setDisabled, toggleClass} from '../utils/dom-functions';
import {downloadImages} from '../utils/download-functions';
import {mediaTypes} from './media-types';


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
  const type = gridItem.getAttribute('data-type') as MediaInfoKey;
  const isChecked = gridItem.classList.contains('checked');
  const newValue = !isChecked;
  toggleClass(gridItem, 'checked');

  const [tab_id, tabUuid, itemIdx] = itemIndex.split('-');
  const groupIndexInSection = mediaInTabs.findIndex(({tabId}) => tabId === +tab_id);
  const tabIndexInSection = mediaInTabs[groupIndexInSection].elements.findIndex(obj => obj.tabUuid === tabUuid);
  if (tabIndexInSection === -1) {
    return;
  }
  mediaInTabs[groupIndexInSection].elements[tabIndexInSection].media[type][+itemIdx].selected = newValue;

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

export function selectSection(name: MediaInfoKey) {
  name = mediaTypes.includes(name) ? name : MediaInfoKeyEnum.IMAGE;
  setStorageValue({lastOpenSection: name});
  toggleClass('.section-buttons button', 'selected', false);
  toggleClass(
    `.section-buttons button[data-section="${name}"]`,
    'selected',
    true,
  );
}

export function setDomListeners() {
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

    if (target.matches('.changelog-link')) {
      setStorageValue({showChangelogLink: false});
      createTab({url: 'views/changelog.html'});
      hide(target);
      return;
    }

    if (target.closest('.accordion-header')) {
      const header = target.closest('.accordion-header');
      toggleClass(header.closest('.accordion-item'), 'active');
    }
  });

  q('#toggle_all_checkbox')!.addEventListener('change', changeToggleAllCheckbox);
}
