import {isTabExpanded} from '../media-display';
import {tabsInfo} from '../media-in-tabs';
import {NullableString} from '../types/common.type';
import {DisplayMediaItem, MediaToDisplay, MediaToDisplayItem} from '../types/media-display.type';
import {MediaInfoKeyEnum} from '../types/media-in-tabs.type';
import {
  createButtonElement,
  createDivElement,
  createElement,
  createIconElement,
  createImgElement,
  createSpanElement,
  q,
} from '../utils/dom-functions';

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

function getGridItem(item: DisplayMediaItem, itemIndex: string) {
  const {src, alt, poster, type, selected, filetype} = item;
  const gridItem = createDivElement({
    class: ['grid-item', ...(selected ? ['checked'] : [])],
    attributes: {
      'data-src-dw': src,
      'data-filename': alt?.length ? alt : '',
      'data-item-idx': itemIndex,
      'data-type': type,
    },
  });

  const btn = createButtonElement(
    {class: 'download_image_button'},
    createIconElement('download'),
  );
  const anchor = createElement('a', {
    attributes: {href: item.src, download: item.alt || ''},
  }, btn);

  const dimensionsDiv = createSpanElement({class: 'item-details-dimensions'});
  const details = createSpanElement({class: 'item-details'}, [
    createSpanElement({class: 'item-details-ext', html: filetype}),
    dimensionsDiv,
  ]);

  let thumbnail = null;
  switch (type) {
    case MediaInfoKeyEnum.IMAGE:
      dimensionsDiv.textContent = `${item.properties.width} x ${item.properties.height}`;
      thumbnail = getImageThumbnail(src);
      break;
    case MediaInfoKeyEnum.AUDIO:
      dimensionsDiv.textContent = item.properties.durationStr;
      thumbnail = getAudioThumbnail();
      break;
    case MediaInfoKeyEnum.VIDEO:
      dimensionsDiv.textContent = item.properties.quality;
      thumbnail = getVideoThumbnail(poster);
      break;
  }

  gridItem.appendChild(anchor);
  gridItem.appendChild(details);

  if (thumbnail) {
    gridItem.appendChild(thumbnail);
  }

  return gridItem;
}

function getAccordionHeader(favicon: string, name: string, allCount: number) {
  return createDivElement(
    {class: 'accordion-header'},
    createButtonElement({class: 'accordion-button'}, [
      createImgElement({src: favicon, class: 'favicon', alt: 'Favicon'}),
      createSpanElement({class: 'tab-title'}, [
        createSpanElement({class: 'title', html: name}),
        createSpanElement({class: 'tab-media-count', html: `(${allCount})`}),
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

function getAccordionBody(items: DisplayMediaItem[], tabId: number, tabUuid: string, restricted: boolean) {
  const body = createDivElement({class: 'accordion-body'});
  if (!restricted) {
    body.append(...items.map(item => {
      return getGridItem(item, `${tabId}-${tabUuid}-${item.uuid}`);
    }));
  } else {
    body.appendChild(getYtRestrictionInfo());
    body.classList.add('restricted');
  }

  return body;
}

function getAccordionItem(mediaToDisplayItem: MediaToDisplayItem) {
  const {title, uuid, id, favIconUrl, isRestricted} = tabsInfo[mediaToDisplayItem.tabUuid];
  const expanded = isTabExpanded(uuid);
  const item = createDivElement({
    class: ['accordion-item', ...(expanded ? ['active'] : [])],
  });
  item.setAttribute('tab-uuid', uuid);
  const header = getAccordionHeader(favIconUrl, title, mediaToDisplayItem.items.length);
  const body = getAccordionBody(mediaToDisplayItem.items, id, uuid, isRestricted);
  item.appendChild(header);
  item.appendChild(body);
  return item;
}

function getAccordionGroup(group: MediaToDisplay) {
  const groupDiv = createDivElement({
    class: 'accordion-group',
    attributes: {
      'data-tab-subgroup': group.tabId,
    },
  });
  group.data.forEach((mediaToDisplayItem: MediaToDisplayItem) => {
    groupDiv.appendChild(getAccordionItem(mediaToDisplayItem));
  });
  return groupDiv;
}

export function updateAccordionData(mediaToDisplay: MediaToDisplay[]) {
  const accordion = q('.accordion');
  accordion.innerHTML = '';
  mediaToDisplay.forEach((group: MediaToDisplay) => {
    accordion.appendChild(getAccordionGroup(group));
  });
}
