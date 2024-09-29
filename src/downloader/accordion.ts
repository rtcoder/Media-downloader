import {DisplayMediaItem, MediaToDisplayItem} from '../types/media-display.type';
import {
  createButtonElement,
  createDivElement,
  createElement,
  createIconElement,
  createImgElement,
  createSpanElement,
  q,
} from '../utils/dom-functions';
import {downloadItem} from '../utils/download-functions';
import {_dispatchEvent, formatTime, getQualityLabel} from '../utils/utils';

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
  /**
   *
   * @type {HTMLVideoElement}
   */
  const videoElement = createElement('video', {src, poster}) as HTMLVideoElement;
  videoElement.addEventListener('loadedmetadata', () => {
    const quality = getQualityLabel(videoElement.videoWidth);
    const gridItem = videoElement.closest('grid-item');
    gridItem?.setAttribute('video-quality', quality);
  });

  thumbnailDiv.appendChild(videoElement);
  return thumbnailDiv;
}

function getGridItem(item: DisplayMediaItem, itemIndex: string) {
  const {src, alt, poster, type, selected} = item;
  const gridItem = createDivElement({
    class: ['grid-item', ...(selected ? ['checked'] : [])],
  });
  gridItem.setAttribute('item-idx', itemIndex);

  const btn = createButtonElement(
    {class: 'download_image_button'},
    createIconElement('download'),
  );
  btn.addEventListener('click', () => {
    downloadItem({
      url: src,
      alt: alt?.length ? alt : null,
    });
  });

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
    thumbnail.addEventListener('click', () => {
      const checked = gridItem.classList.contains('checked');
      _dispatchEvent(document, 'thumbnail-clicked', {
        itemIndex,
        value: !checked,
        type,
      });
    });
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

function getAccordionHeader(expanded: boolean, favicon: string, name: string, allCount: number) {
  // header.addEventListener('click', () => {
  //    _dispatchEvent(document, 'accordion-header-clicked', {itemIndex});
  // });
  return createDivElement(
    {class: ['accordion-header', ...(expanded ? ['active'] : [])]},
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

function getAccordionBody(items: DisplayMediaItem[], tabId: number, expanded: boolean) {
  return createDivElement(
    {class: 'accordion-body', hidden: !expanded},
    items.map((item, idx: number) => {
      return getGridItem(item, `${tabId}-${idx}`);
    }),
  );
}

function getAccordionItem(mediaToDisplayItem: MediaToDisplayItem, expanded = false) {
  const {favIconUrl, title, id} = mediaToDisplayItem.tab;
  const item = createDivElement({class: 'accordion-item'});
  item.setAttribute('tab-id', id);
  const header = getAccordionHeader(true, favIconUrl, title, mediaToDisplayItem.items.length);
  const body = getAccordionBody(mediaToDisplayItem.items, id, expanded);
  if (!mediaToDisplayItem.showHeader) {
    header.hidden = true;
  }
  item.appendChild(header);
  item.appendChild(body);
  return item;
}

function findAccordionItem(accordion: Element, tabId: number) {
  return accordion.querySelector(`.accordion-item[tab-id="${tabId}"]`);
}

function findAccordionGridItem(accordionItem: Element, itemIndex: string) {
  return accordionItem.querySelector(`.grid-item[item-idx="${itemIndex}"]`);
}

export function updateAccordionData(data: MediaToDisplayItem[]) {
  const accordion = q('.accordion');

  data.forEach((mediaToDisplayItem: MediaToDisplayItem) => {
    const tabId = mediaToDisplayItem.tab.id;
    const accordionItem = findAccordionItem(accordion, tabId);
    if (!accordionItem) {
      accordion.appendChild(getAccordionItem(mediaToDisplayItem));
      return;
    }

    mediaToDisplayItem.items.forEach((displayMediaItem: DisplayMediaItem, idx: number) => {
      const itemIdx = `${tabId}-${idx}`;
      const gridItem = findAccordionGridItem(accordionItem, itemIdx);
      if (!gridItem) {
        accordionItem.querySelector('.accordion-body')!
          .appendChild(getGridItem(displayMediaItem, itemIdx));
      }
    });
  });
}
