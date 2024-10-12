import {displayMedia, getAllMediaToDisplay, isTabExpanded, setTabExpanded} from '../media-display';
import {mediaInTabs} from '../media-in-tabs';
import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {createTab, setStorageValue} from '../utils/chrome-api';
import {hide, q, setDisabled, toggleClass} from '../utils/dom-functions';
import {downloadSelectedImages} from '../utils/download-functions';
import {updateFiltersIconActive} from './filters/filters';
import {mediaTypes} from './media-types';


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

  let allAreUnchecked = true;
  const mediaToDisplay = getAllMediaToDisplay();
  let selectedCount = 0;

  for (let _idx = 0; _idx < mediaToDisplay.length; _idx++) {
    if (mediaToDisplay[_idx].selected) {
      allAreUnchecked = false;
      selectedCount++;
    }
  }

  updateSelectedCountText(selectedCount);
}

function updateSelectedCountText(selectedCount: number) {
  q('#download-btn .selected-count')!.innerHTML = selectedCount > 0
    ? `(${selectedCount})`
    : '';

  setDisabled('#download-btn', !selectedCount);
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
  updateFiltersIconActive();
  setTopContainerHeightVar();
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
