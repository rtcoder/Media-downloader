import {isTabExpanded} from '../media-display';
import {tabsInfo} from '../media-in-tabs';
import {NullableString} from '../types/common.type';
import {DisplayMediaItem,  MediaToDisplay, MediaToDisplayItem} from '../types/media-display.type';
import {MediaInfoKey} from '../types/media-in-tabs.type';
import {
  createButtonElement,
  createDivElement,
  createElement,
  createIconElement,
  createImgElement,
  createSpanElement,
  q,
} from '../utils/dom-functions';
import {formatTime, getQualityLabel} from '../utils/utils';

function imageLoad(imgEl: HTMLImageElement) {
  imgEl.addEventListener('load', () => {
    const naturalWidth = imgEl.naturalWidth.toString();
    const naturalHeight = imgEl.naturalHeight.toString();
    const gridItem = imgEl.closest('.grid-item');
    gridItem?.setAttribute('original-width', naturalWidth);
    gridItem?.setAttribute('original-height', naturalHeight);
  });
}

function videoLoad(videoEl: HTMLVideoElement) {
  videoEl.addEventListener('loadedmetadata', () => {
    const quality = getQualityLabel(videoEl.videoWidth);
    const gridItem = videoEl.closest('.grid-item');
    gridItem?.setAttribute('video-quality', quality);
    videoEl.remove();
  });
}

function audioLoad(audioEl: HTMLAudioElement) {
  audioEl.addEventListener('loadedmetadata', () => {
    const duration = formatTime(audioEl.duration);
    const gridItem = audioEl.closest('.grid-item');
    gridItem?.setAttribute('audio-duration', duration);
    audioEl.remove();
  });
}

function loadThumbnail(thumbnail: HTMLDivElement, type: MediaInfoKey) {
  switch (type) {
    case 'image':
      imageLoad(thumbnail.querySelector('img')!);
      break;
    case 'audio':
      audioLoad(thumbnail.querySelector('audio')!);
      break;
    case 'video':
      videoLoad(thumbnail.querySelector('video')!);
      break;
  }
}

function getThumbnailContainer() {
  return createDivElement({
    class: 'thumbnail',
  });
}

function getAudioThumbnail(src: string) {
  const thumbnailDiv = getThumbnailContainer();
  const icon = createIconElement('music_note', 50);
  const audio = createElement('audio', {src}) as HTMLAudioElement;

  thumbnailDiv.appendChild(icon);
  thumbnailDiv.appendChild(audio);
  return thumbnailDiv;
}

function getImageThumbnail(src: string) {
  const thumbnailDiv = getThumbnailContainer();
  const imgElement = createImgElement({src});
  thumbnailDiv.appendChild(imgElement);
  return thumbnailDiv;
}

function getVideoThumbnail(src: string, poster?: NullableString) {
  const thumbnailDiv = getThumbnailContainer();
  const icon = createIconElement('videocam', 50);
  const imagePoster = createImgElement({src: poster});
  const videoElement = createElement('video', {src, poster}) as HTMLVideoElement;

  thumbnailDiv.appendChild(poster ? imagePoster : icon);
  thumbnailDiv.appendChild(videoElement);
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

  const details = createSpanElement({class: 'item-details'}, [
    createSpanElement({class: 'item-details-ext', html: filetype}),
    createSpanElement({class: 'item-details-dimensions'}),
  ]);

  let thumbnail = null;
  switch (type) {
    case 'image':
      thumbnail = getImageThumbnail(src);
      break;
    case 'audio':
      thumbnail = getAudioThumbnail(src);
      break;
    case 'video':
      thumbnail = getVideoThumbnail(src, poster);
      break;
  }

  gridItem.appendChild(anchor);
  gridItem.appendChild(details);

  if (thumbnail) {
    gridItem.appendChild(thumbnail);
    loadThumbnail(thumbnail, type);
  }

  // Dodanie obserwatora zmian atrybutów do gridItem
  const observer = new MutationObserver((mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === 'attributes') {
        updateDetails(
          gridItem,
          type,
          observer,
        );
      }
    });
  });

  // Obserwowanie zmian atrybutów duration, quality, extension, width, height w gridItem
  observer.observe(gridItem, {
    attributes: true,
    attributeFilter: ['audio-duration', 'video-quality', 'original-width', 'original-height'],
  });
  return gridItem;
}

function updateDetails(gridItem: Element, type: string, observer: MutationObserver) {
  const details = gridItem.querySelector('.item-details')!;

  const dimensionsDiv = details.querySelector('.item-details-dimensions')!;
  const duration = gridItem.getAttribute('audio-duration');
  const width = gridItem.getAttribute('original-width');
  const height = gridItem.getAttribute('original-height');
  const quality = gridItem.getAttribute('video-quality');

  console.log({duration, width, height, quality});

  switch (type) {
    case 'audio':
      dimensionsDiv.textContent = duration;
      if (duration) {
        observer.disconnect();
      }
      break;
    case 'image':
      dimensionsDiv.textContent = `${width} x ${height}`;
      if (width && height) {
        observer.disconnect();
      }
      break;
    case 'video':
      dimensionsDiv.textContent = quality;
      if (quality) {
        observer.disconnect();
      }
      break;
  }
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
