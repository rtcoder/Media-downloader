import {isTabExpanded} from '../media-display';
import {DisplayMediaItem, MediaToDisplay, MediaToDisplayItem} from '../types/media-display.type';
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

function getThumbnailContainer() {
  return createDivElement({
    class: 'thumbnail',
  });
}

function getAudioThumbnail(src: string) {
  const thumbnailDiv = getThumbnailContainer();
  const icon = createIconElement('music_note', 50);
  const audio = createElement('audio', {src}) as HTMLAudioElement;
  audio.addEventListener('loadedmetadata', () => {
    const duration = formatTime(audio.duration);
    const gridItem = audio.closest('.grid-item');
    gridItem?.setAttribute('duration', duration);
    audio.remove();
  });

  thumbnailDiv.appendChild(icon);
  thumbnailDiv.appendChild(audio);
  return thumbnailDiv;
}

function getImageThumbnail(src: string) {
  const thumbnailDiv = getThumbnailContainer();
  const imgElement = createImgElement({src});
  imgElement.addEventListener('load', () => {
    const naturalWidth = imgElement.naturalWidth.toString();
    const naturalHeight = imgElement.naturalHeight.toString();
    const gridItem = imgElement.closest('grid-item');
    gridItem?.setAttribute('original-width', naturalWidth);
    gridItem?.setAttribute('original-height', naturalHeight);
  });

  thumbnailDiv.appendChild(imgElement);
  return thumbnailDiv;
}

function getVideoThumbnail(src: string, poster?: string | null) {
  const thumbnailDiv = getThumbnailContainer();
  const icon = createIconElement('videocam', 50);
  const imagePoster = createImgElement({src: poster});
  const videoElement = createElement('video', {src, poster}) as HTMLVideoElement;
  videoElement.addEventListener('loadedmetadata', () => {
    const quality = getQualityLabel(videoElement.videoWidth);
    const gridItem = videoElement.closest('grid-item');
    gridItem?.setAttribute('video-quality', quality);
    videoElement.remove();
  });

  thumbnailDiv.appendChild(poster ? imagePoster : icon);
  thumbnailDiv.appendChild(videoElement);
  return thumbnailDiv;
}

function getGridItem(item: DisplayMediaItem, itemIndex: string) {
  const {src, alt, poster, type, selected} = item;
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

  const details = createSpanElement({class: 'item-details'}, [
    createSpanElement({class: 'item-details-ext'}),
    createSpanElement({class: 'item-details-dimensions'}),
  ]);

  let thumbnail = null;
  if (type === 'audio') {
    thumbnail = getAudioThumbnail(src);
  } else if (type === 'image') {
    thumbnail = getImageThumbnail(src);
  } else if (type === 'video') {
    thumbnail = getVideoThumbnail(src, poster);
  }

  gridItem.appendChild(btn);
  gridItem.appendChild(details);

  if (thumbnail) {
    gridItem.appendChild(thumbnail);
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
    attributeFilter: ['duration', 'quality', 'extension', 'width', 'height'],
  });
  return gridItem;
}

function updateDetails(gridItem: Element, type: string, observer: MutationObserver) {
  const details = gridItem.querySelector('.item-details')!;

  const dimensionsDiv = details.querySelector('.item-details-dimensions')!;
  const extension = gridItem.getAttribute('extension');
  const duration = gridItem.getAttribute('duration');
  const width = gridItem.getAttribute('width');
  const height = gridItem.getAttribute('height');
  const quality = gridItem.getAttribute('quality');

  if (extension) {
    details.querySelector('.item-details-ext')!.textContent = extension;
  }

  switch (type) {
    case 'audio':
      dimensionsDiv.textContent = duration;
      if (extension && duration) {
        observer.disconnect();
      }
      break;
    case 'image':
      dimensionsDiv.textContent = `${width} x ${height}`;
      if (extension && width && height) {
        observer.disconnect();
      }
      break;
    case 'video':
      dimensionsDiv.textContent = quality;
      if (extension && quality) {
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
        createSpanElement({class: 'tab-media-count', html: allCount}),
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
    body.append(...items.map((item, idx: number) => {
      return getGridItem(item, `${tabId}-${tabUuid}-${idx}`);
    }));
  } else {
    body.appendChild(getYtRestrictionInfo());
    body.classList.add('restricted');
  }

  return body;
}

function getAccordionItem(mediaToDisplayItem: MediaToDisplayItem) {
  const {favIconUrl, title, uuid, id} = mediaToDisplayItem.tab;
  const expanded = isTabExpanded(uuid);
  const item = createDivElement({
    class: ['accordion-item', ...(expanded ? ['active'] : [])],
  });
  item.setAttribute('tab-uuid', uuid);
  const header = getAccordionHeader(favIconUrl, title, mediaToDisplayItem.items.length);
  const body = getAccordionBody(mediaToDisplayItem.items, id, uuid, mediaToDisplayItem.tab.isRestricted);
  item.appendChild(header);
  item.appendChild(body);
  return item;
}

function findAccordionItem(accordion: Element, tabUuid: string): Element | null {
  return accordion.querySelector(`.accordion-item[tab-uuid="${tabUuid}"]`);
}

function findAccordionGridItem(accordionItem: Element, itemIndex: string) {
  return accordionItem.querySelector(`.grid-item[data-item-idx="${itemIndex}"]`);
}

export function updateAccordionData(mediaToDisplay: MediaToDisplay[]) {
  const accordion = q('.accordion');
  accordion.innerHTML = '';
  mediaToDisplay.forEach((group: MediaToDisplay) => {
    const groupDiv = createDivElement({
      attributes: {
        'data-tab-subgroup': group.tabId,
      },
    });
    group.data.forEach((mediaToDisplayItem: MediaToDisplayItem) => {
      groupDiv.appendChild(getAccordionItem(mediaToDisplayItem));
    });
    accordion.appendChild(groupDiv);
  });
}
