import {NullableString} from '../../types/common.type';
import {createDivElement, createIconElement, createImgElement} from '../../utils/dom-functions';

function getThumbnailContainer() {
  return createDivElement({class: 'thumbnail'});
}

export function getAudioThumbnail() {
  const thumbnailDiv = getThumbnailContainer();
  const icon = createIconElement('music_note', 50);

  thumbnailDiv.appendChild(icon);
  return thumbnailDiv;
}

export function getImageThumbnail(src: string) {
  const thumbnailDiv = getThumbnailContainer();
  const imgElement = createImgElement({src});
  thumbnailDiv.appendChild(imgElement);
  return thumbnailDiv;
}

export function getVideoThumbnail(poster: NullableString) {
  const thumbnailDiv = getThumbnailContainer();
  const icon = createIconElement('videocam', 50);
  const imagePoster = createImgElement({src: poster});

  thumbnailDiv.appendChild(poster ? imagePoster : icon);
  return thumbnailDiv;
}

