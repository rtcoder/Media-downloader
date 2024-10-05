import {NullableString} from '../types/common.type';
import {qAll} from '../utils/dom-functions';
import {isAudioURL, isImageURL, isNotEmpty, isNotYouTubeLink, isVideoURL} from './filters-fn';
import {mapToFullInfo} from './mappers-fn';

async function extractImageFromElement(element: Element) {
  if (element.tagName.toLowerCase() === 'img') {
    const src = getSrcFromElement(element);
    return mapToFullInfo(src, element);
  }

  if (element.tagName.toLowerCase() === 'a') {
    const href = (element as HTMLAnchorElement).href;
    if (isImageURL(href)) {
      return mapToFullInfo(href, element);
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

async function extractVideoFromElement(element: Element) {
  if (element.tagName.toLowerCase() === 'video') {
    const sourceElement = element.querySelector('source');
    const src = sourceElement
      ? getSrcFromElement(sourceElement)
      : getSrcFromElement(element);
    return mapToFullInfo(src, element, getPosterFromVideoElement(element));
  }

  if (element.tagName.toLowerCase() === 'a') {
    const href = (element as HTMLAnchorElement).href;
    if (isVideoURL(href)) {
      return mapToFullInfo(href, element, null);
    }
  }
  return mapToFullInfo('', null, null);
}

async function extractAudioFromElement(element: Element) {
  if (element.tagName.toLowerCase() === 'audio') {
    const sourceElement = element.querySelector('source');
    const src = sourceElement
      ? getSrcFromElement(sourceElement)
      : getSrcFromElement(element);
    return mapToFullInfo(src, element);
  }

  if (element.tagName.toLowerCase() === 'a') {
    const href = (element as HTMLAnchorElement).href;
    if (isAudioURL(href)) {
      return mapToFullInfo(href, element);
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

export function getAltFromElement(element: Element) {
  const alt = element.getAttribute('alt');
  if (!alt) {
    return null;
  }
  if (alt.length === 0) {
    return null;
  }
  return alt;
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

export async function extractDataFromTags(selectors: string, mapFn: (el: Element) => any) {
  const elements = [...qAll(selectors)];
  const promises = elements.map(mapFn);
  const results = await Promise.all(promises);
  return results
    .filter(isNotEmpty)
    .filter(isNotYouTubeLink);
}

export async function extractImagesFromTags() {
  return extractDataFromTags('img, a, [style]', extractImageFromElement);
}

export async function extractVideosFromTags() {
  return extractDataFromTags('video, a', extractVideoFromElement);
}

export async function extractAudiosFromTags() {
  return extractDataFromTags('audio, a', extractAudioFromElement);
}

export function extractImagesFromStyles() {
  return Promise.all((Array.from(document.styleSheets) as CSSStyleSheet[])
    .filter(styleSheet => styleSheet.hasOwnProperty('cssRules'))
    .map(({cssRules}) => Array.from(cssRules))
    .flat()
    .filter((cssRule: any) => cssRule.style && cssRule.style.backgroundImage)
    .map((cssRule: any) => extractURLFromStyle(cssRule.style.backgroundImage))
    .filter((url: NullableString) => !!url)
    .filter((url: string) => isImageURL(url))
    .map((url: string) => mapToFullInfo(url)));
}
