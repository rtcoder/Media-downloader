import {displayMedia, getAllMediaToDisplay} from '../media-display';
import {mediaInTabs} from '../media-in-tabs';
import {ItemTypeEnum} from '../types/media-in-tabs.type';
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

  for (let _idx = 0; _idx < mediaToDisplay.length; _idx++) {
    mediaToDisplay[_idx].selected = checked;
    if (mediaToDisplay[_idx].selected) {
      allAreUnchecked = false;
      selectedCount++;
    } else {
      allAreChecked = false;
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
  const isChecked = gridItem.classList.contains('checked');
  const newValue = !isChecked;
  toggleClass(gridItem, 'checked');

  const itemIndexInMedia = mediaInTabs.findIndex(obj => obj.itemIndex === itemIndex);
  if (itemIndexInMedia === -1) {
    return;
  }
  mediaInTabs[itemIndexInMedia].selected = newValue;

  let allAreChecked = true;
  let allAreUnchecked = true;
  const mediaToDisplay = getAllMediaToDisplay();
  let selectedCount = 0;

  for (let _idx = 0; _idx < mediaToDisplay.length; _idx++) {
    if (mediaToDisplay[_idx].selected) {
      allAreUnchecked = false;
      selectedCount++;
    } else {
      allAreChecked = false;
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

export function selectSection(name: ItemTypeEnum) {
  name = mediaTypes.includes(name) ? name : ItemTypeEnum.IMAGE;
  setStorageValue({lastOpenSection: name});
  toggleClass('.section-buttons button', 'selected', false);
  toggleClass(
    `.section-buttons button[data-section="${name}"]`,
    'selected',
    true,
  );
  const filtersDiv = q('.filters');
  filtersDiv.classList.remove(ItemTypeEnum.IMAGE, ItemTypeEnum.AUDIO, ItemTypeEnum.VIDEO);
  filtersDiv.classList.add(name);
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
