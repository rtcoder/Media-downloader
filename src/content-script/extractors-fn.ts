import {NullableString} from '../types/common.type';
import {qAll} from '../utils/dom-functions';
import {isAudioURL, isImageURL, isNotEmpty, isNotYouTubeLink, isVideoURL} from './filters-fn';
import {mapToFullInfo} from './mappers-fn';

 function extractImageFromElement(element: Element) {
  if (element.tagName.toLowerCase() === 'img') {
    const src = getSrcFromElement(element);
    return mapToFullInfo(src);
  }

  if (element.tagName.toLowerCase() === 'a') {
    const href = (element as HTMLAnchorElement).href;
    if (isImageURL(href)) {
      return mapToFullInfo(href);
    }
  }

  const backgroundImage = window.getComputedStyle(element).backgroundImage;
  if (backgroundImage) {
    const parsedURL = extractURLFromStyle(backgroundImage);
    if (isImageURL(parsedURL)) {
      return mapToFullInfo(parsedURL);
    }
  }

  return mapToFullInfo();
}

 function extractVideoFromElement(element: Element) {
  if (element.tagName.toLowerCase() === 'video') {
    const sourceElement = element.querySelector('source');
    const src = sourceElement
      ? getSrcFromElement(sourceElement)
      : getSrcFromElement(element);
    return mapToFullInfo(src,  getPosterFromVideoElement(element));
  }

  if (element.tagName.toLowerCase() === 'a') {
    const href = (element as HTMLAnchorElement).href;
    if (isVideoURL(href)) {
      return mapToFullInfo(href, null);
    }
  }
  return mapToFullInfo('',  null);
}

 function extractAudioFromElement(element: Element) {
  if (element.tagName.toLowerCase() === 'audio') {
    const sourceElement = element.querySelector('source');
    const src = sourceElement
      ? getSrcFromElement(sourceElement)
      : getSrcFromElement(element);
    return mapToFullInfo(src);
  }

  if (element.tagName.toLowerCase() === 'a') {
    const href = (element as HTMLAnchorElement).href;
    if (isAudioURL(href)) {
      return mapToFullInfo(href);
    }
  }
  return mapToFullInfo();
}

function extractURLFromStyle(url: string) {
  return url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
}

function getSrcFromElement(element: Element) {
  let src = element.getAttribute('src') || '';
  const hashIndex = src?.indexOf('#');
  if (hashIndex >= 0) {
    src = src.substring(0, hashIndex + 1);
  }
  return src;
}

function getPosterFromVideoElement(element: Element) {
  let poster = element.getAttribute('poster')
    || element.getAttribute('data-poster')
    || '';
  const hashIndex = poster?.indexOf('#');
  if (hashIndex >= 0) {
    poster = poster.substring(0, hashIndex + 1);
  }
  return poster;
}

export  function extractDataFromTags(selectors: string, mapFn: (el: Element) => any) {
  const elements = [...qAll(selectors)];
  return elements.map(mapFn)
    .filter(isNotEmpty)
    .filter(isNotYouTubeLink);
}

export  function extractImagesFromTags() {
  return extractDataFromTags('img, a, [style]', extractImageFromElement);
}

export  function extractVideosFromTags() {
  return extractDataFromTags('video, a', extractVideoFromElement);
}

export  function extractAudiosFromTags() {
  return extractDataFromTags('audio, a', extractAudioFromElement);
}

export function extractImagesFromStyles() {
  return (Array.from(document.styleSheets) as CSSStyleSheet[])
    .filter(styleSheet => styleSheet.hasOwnProperty('cssRules'))
    .map(({cssRules}) => Array.from(cssRules))
    .flat()
    .filter((cssRule: any) => cssRule.style && cssRule.style.backgroundImage)
    .map((cssRule: any) => extractURLFromStyle(cssRule.style.backgroundImage))
    .filter((url: NullableString) => !!url)
    .filter((url: string) => isImageURL(url))
    .map((url: string) => mapToFullInfo(url));
}
