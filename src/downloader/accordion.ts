import {getAllMediaToDisplay, isTabExpanded} from '../media-display';
import {getTabsFromCollection, tabCollections} from '../media-in-tabs';
import {NullableString} from '../types/common.type';
import {ItemTypeEnum, MediaItem} from '../types/media-in-tabs.type';
import {TabData} from '../types/tab-data.type';
import {
  createButtonElement,
  createDivElement,
  createElement,
  createIconElement,
  createImgElement,
  createSpanElement,
  q,
} from '../utils/dom-functions';
import {getCurrentSection} from '../utils/utils';
import {applyFilters} from './filters/filter-fn';

function getThumbnailContainer() {
  return createDivElement({
    class: 'thumbnail',
  });
}

function getAudioThumbnail() {
  const thumbnailDiv = getThumbnailContainer();
  const icon = createIconElement('music_note', 50);

  thumbnailDiv.appendChild(icon);
  return thumbnailDiv;
}

function getImageThumbnail(src: string) {
  const thumbnailDiv = getThumbnailContainer();
  const imgElement = createImgElement({src});
  thumbnailDiv.appendChild(imgElement);
  return thumbnailDiv;
}

function getVideoThumbnail(poster: NullableString) {
  const thumbnailDiv = getThumbnailContainer();
  const icon = createIconElement('videocam', 50);
  const imagePoster = createImgElement({src: poster});

  thumbnailDiv.appendChild(poster ? imagePoster : icon);
  return thumbnailDiv;
}

function getGridItem(item: MediaItem) {
  const gridItem = createDivElement({
    class: ['grid-item', ...(item.selected ? ['checked'] : [])],
    attributes: {'data-item-idx': item.itemIndex},
  });

  const btn = createButtonElement(
    {class: 'download_image_button'},
    createIconElement('download'),
  );
  const anchor = createElement('a', {
    attributes: {href: item.src, download: ''},
  }, btn);

  const dimensionsDiv = createSpanElement({class: 'item-details-dimensions'});
  const details = createSpanElement({class: 'item-details'}, [
    createSpanElement({class: 'item-details-ext', html: item.extension}),
    dimensionsDiv,
  ]);

  let thumbnail = null;
  switch (item.type) {
    case ItemTypeEnum.IMAGE:
      dimensionsDiv.textContent = `${item.properties.width} x ${item.properties.height}`;
      thumbnail = getImageThumbnail(item.src);
      break;
    case ItemTypeEnum.AUDIO:
      dimensionsDiv.textContent = item.properties.durationStr;
      thumbnail = getAudioThumbnail();
      break;
    case ItemTypeEnum.VIDEO:
      dimensionsDiv.textContent = item.properties.quality;
      thumbnail = getVideoThumbnail(item.poster);
      break;
  }

  gridItem.appendChild(anchor);
  gridItem.appendChild(details);

  if (thumbnail) {
    gridItem.appendChild(thumbnail);
  }

  return gridItem;
}

function getAccordionHeader(favicon: string, name: string, allCount: number, unfilteredCount: number) {
  const count = allCount === unfilteredCount
    ? `(${allCount})`
    : `(${allCount} / ${unfilteredCount})`;
  return createDivElement(
    {class: 'accordion-header'},
    createButtonElement({class: 'accordion-button'}, [
      createImgElement({src: favicon, class: 'favicon', alt: 'Favicon'}),
      createSpanElement({class: 'tab-title'}, [
        createSpanElement({class: 'title', html: name}),
        createSpanElement({class: 'tab-media-count', html: count}),
      ]),
      createSpanElement({class: 'tab-toggle'}),
    ]),
  );
}

function getYtRestrictionInfo() {
  return createDivElement({class: 'yt-info'}, [
    createSpanElement({
      html: 'Note: Chrome Web Store does not allow extensions that download videos from YouTube any longer.',
    }),
    createElement('a', {
      href: 'https://developer.chrome.com/docs/webstore/troubleshooting/#prohibited-products',
      html: 'Chrome policy',
    }),
  ]);
}

function getAccordionBody(items: MediaItem[], tabId: number, tabUuid: string, restricted: boolean) {
  const body = createDivElement({class: 'accordion-body'});
  if (!restricted) {
    body.append(...items.sort((a, b) => a.order - b.order).map(item => {
      return getGridItem(item);
    }));
  } else {
    body.appendChild(getYtRestrictionInfo());
    body.classList.add('restricted');
  }

  return body;
}

function getAccordionItem(tabData: TabData) {
  const {title, uuid, id, favIconUrl, isRestricted} = tabData;
  const expanded = isTabExpanded(uuid);
  const item = createDivElement({
    class: ['accordion-item', ...(expanded ? ['active'] : [])],
  });
  item.setAttribute('tab-uuid', uuid);

  const type = getCurrentSection();
  const mediaToDisplay = getAllMediaToDisplay(uuid);
  const filteredMediaToDisplay = applyFilters(type, mediaToDisplay);

  const header = getAccordionHeader(favIconUrl, title, filteredMediaToDisplay.length, mediaToDisplay.length);
  const body = getAccordionBody(filteredMediaToDisplay, id, uuid, isRestricted);
  item.appendChild(header);
  item.appendChild(body);
  return item;
}

function getAccordionGroup(tabId: number) {
  const groupDiv = createDivElement({
    class: 'accordion-group',
    attributes: {
      'data-tab-subgroup': tabId,
    },
  });
  getTabsFromCollection(tabId).forEach((tabData: TabData) => {
    groupDiv.appendChild(getAccordionItem(tabData));
  });
  return groupDiv;
}

export function updateAccordionData() {
  const accordion = q('.accordion');
  accordion.innerHTML = '';
  tabCollections.forEach(tabId => {
    accordion.appendChild(getAccordionGroup(tabId));
  });
}
