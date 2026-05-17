import {displayMedia, getAllMediaToDisplay, isTabExpanded, setTabExpanded} from '../media-display';
import {mediaInTabs} from '../media-in-tabs';
import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {createTab, setStorageValue} from '../utils/chrome-api';
import {hide, q, setDisabled, toggleClass} from '../utils/dom-functions';
import {downloadSelectedImages} from '../utils/download-functions';
import {updateFiltersIconActive} from './filters/filters';
import {mediaTypes} from './media-types';

let lastClickedItemIndex: string | null = null;

function setMediaItemSelected(itemIndex: string, selected: boolean) {
  const itemIndexInMedia = mediaInTabs.findIndex(obj => obj.itemIndex === itemIndex);
  if (itemIndexInMedia === -1) {
    return;
  }

  mediaInTabs[itemIndexInMedia].selected = selected;
}

function setGridItemSelected(gridItem: HTMLElement, selected: boolean) {
  const itemIndex = gridItem.getAttribute('data-item-idx');
  if (!itemIndex) {
    return;
  }

  toggleClass(gridItem, 'checked', selected);
  setMediaItemSelected(itemIndex, selected);
}

function getVisibleGridItems(): HTMLElement[] {
  return Array.from(document.querySelectorAll('.grid-item:not([hidden])')) as HTMLElement[];
}

function selectItemRange(fromItemIndex: string, toGridItem: HTMLElement): boolean {
  const visibleGridItems = getVisibleGridItems();
  const fromIndex = visibleGridItems.findIndex(item => item.getAttribute('data-item-idx') === fromItemIndex);
  const toIndex = visibleGridItems.indexOf(toGridItem);

  if (fromIndex === -1 || toIndex === -1) {
    return false;
  }

  const startIndex = Math.min(fromIndex, toIndex);
  const endIndex = Math.max(fromIndex, toIndex);
  visibleGridItems
    .slice(startIndex, endIndex + 1)
    .forEach(item => setGridItemSelected(item, true));

  return true;
}

function onClickItem(target: any, shiftKey = false) {
  const gridItem = target.closest('.grid-item') as HTMLElement;
  const itemIndex = gridItem.getAttribute('data-item-idx');
  if (!itemIndex) {
    return;
  }

  const rangeSelected = shiftKey && lastClickedItemIndex
    ? selectItemRange(lastClickedItemIndex, gridItem)
    : false;

  if (!rangeSelected) {
    const newValue = !gridItem.classList.contains('checked');
    setGridItemSelected(gridItem, newValue);
  }

  lastClickedItemIndex = itemIndex;
  updateSelectedCountText();
}

function updateSelectedCountText() {
  const mediaToDisplay = getAllMediaToDisplay();
  let selectedCount = 0;

  for (let _idx = 0; _idx < mediaToDisplay.length; _idx++) {
    if (mediaToDisplay[_idx].selected) {
      selectedCount++;
    }
  }
  const summary = q('.selection-label');
  const clearButton = q('.clear-selection') as HTMLButtonElement;
  summary.innerHTML = selectedCount > 0
    ? `${selectedCount} selected`
    : 'No selection';
  clearButton.disabled = !selectedCount;
  setDisabled('#download-btn', !selectedCount);
}

function clearSelection() {
  getAllMediaToDisplay().forEach(item => {
    item.selected = false;
  });
  toggleClass('.grid-item.checked', 'checked', false);
  lastClickedItemIndex = null;
  updateSelectedCountText();
}

export function setTopContainerHeightVar(timeout = 0) {
  setTimeout(() => {
    const topContainer = q('.top');
    const topContainerHeight = topContainer.getBoundingClientRect().height;
    document.body.style.setProperty('--topContainerHeight', `${topContainerHeight}px`);
  }, timeout);
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
  document.body.classList.remove('media-mode-image', 'media-mode-audio', 'media-mode-video');
  document.body.classList.add(`media-mode-${name}`);
  updateFiltersIconActive();
  setTopContainerHeightVar();
  updateSelectedCountText();
}

export function setDomListeners() {
  document.body.addEventListener('click', e => {
    const {target}: { target: any } = e;
    if (!target) {
      return;
    }

    if (target.closest('#download-btn')) {
      downloadSelectedImages(getAllMediaToDisplay());
      return;
    }

    if (target.closest('.clear-selection')) {
      clearSelection();
      return;
    }

    if (target.closest('.section-buttons button')) {
      selectSection(target.closest('.section-buttons button').getAttribute('data-section'));
      lastClickedItemIndex = null;
      displayMedia();
      return;
    }

    if (target.closest('.grid-item')) {
      onClickItem(target, e.shiftKey);
      return;
    }

    if (target.matches('.yt-info a')) {
      window.open('https://developer.chrome.com/docs/webstore/troubleshooting/#prohibited-products');
      return;
    }

    if (target.matches('.changelog-link')) {
      setStorageValue({showChangelogLink: false});
      createTab({url: 'views/changelog/index.html'});
      hide(target);
      return;
    }

    if (target.closest('.accordion-header')) {
      const header = target.closest('.accordion-header');
      const accordionItem = header.closest('.accordion-item');
      const tabUuid = accordionItem.getAttribute('tab-uuid');
      if (isTabExpanded(tabUuid)) {
        setTabExpanded(tabUuid, false);
        toggleClass(header.closest('.accordion-item'), 'active', false);
      } else {
        setTabExpanded(tabUuid, true);
        toggleClass(header.closest('.accordion-item'), 'active', true);
      }
    }
  });

  setTopContainerHeightVar(500);
}
