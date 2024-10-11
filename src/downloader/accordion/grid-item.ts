import {ItemTypeEnum, MediaItem} from '../../types/media-in-tabs.type';
import {
  createButtonElement,
  createDivElement,
  createElement,
  createIconElement,
  createSpanElement,
} from '../../utils/dom-functions';
import {getAudioThumbnail, getImageThumbnail, getVideoThumbnail} from './grid-item-thumbnail';

export function getGridItem(body: HTMLElement, item: MediaItem) {
  const existingItem = body.querySelector(`[data-item-idx="${item.itemIndex}"]`) as HTMLElement;
  if (existingItem) {
    existingItem.hidden = !item.display;
    return existingItem;
  }
  const gridItem = createDivElement({
    class: ['grid-item', ...(item.selected ? ['checked'] : [])],
    attributes: {'data-item-idx': item.itemIndex},
  });
  gridItem.hidden = !item.display;

  const btn = createButtonElement(
    {class: 'download_image_button'},
    createIconElement('download'),
  );
  const anchor = createElement('a', {
    attributes: {href: item.src, download: ''},
  }, btn);

  const dimensionsDiv = createSpanElement({class: 'item-details-dimensions'});
  const extension = createSpanElement({class: 'item-details-ext', html: item.extension});
  const duration = createSpanElement({class: 'item-details-duration'});

  let thumbnail = null;
  switch (item.type) {
    case ItemTypeEnum.IMAGE:
      dimensionsDiv.textContent = `${item.properties.width} x ${item.properties.height}`;
      thumbnail = getImageThumbnail(item.src);
      break;
    case ItemTypeEnum.AUDIO:
      duration.textContent = item.properties.durationStr;
      thumbnail = getAudioThumbnail();
      break;
    case ItemTypeEnum.VIDEO:
      duration.textContent = item.properties.durationStr;
      dimensionsDiv.textContent = item.properties.quality;
      thumbnail = getVideoThumbnail(item.poster);
      break;
  }

  gridItem.appendChild(anchor);
  gridItem.appendChild(extension);
  gridItem.appendChild(dimensionsDiv);
  gridItem.appendChild(duration);

  if (thumbnail) {
    gridItem.appendChild(thumbnail);
  }

  return gridItem;
}
