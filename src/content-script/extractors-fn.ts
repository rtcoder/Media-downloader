import {NullableString} from '../types/common.type';
import {qAll} from '../utils/dom-functions';
import {isAudioURL, isImageURL, isNotEmpty, isNotYouTubeLink, isVideoURL} from './filters-fn';
import {mapToFullInfo} from './mappers-fn';

const imageStyleProperties = [
  'background',
  'backgroundImage',
  'mask',
  'maskImage',
  'borderImage',
  'borderImageSource',
  'listStyle',
  'listStyleImage',
  'cursor',
  'clipPath',
  'content',
  'filter',
  'shapeOutside',
];

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

  if (element.tagName.toLowerCase() === 'object') {
    const data = (element as HTMLAnchorElement).getAttribute('data') || '';
    if (isImageURL(data)) {
      return mapToFullInfo(data);
    }
  }

  if (element.tagName.toLowerCase() === 'embed') {
    const src = (element as HTMLAnchorElement).getAttribute('src') || '';
    if (isImageURL(src)) {
      return mapToFullInfo(src);
    }
  }

  if (element.tagName.toLowerCase() === 'picture') {
    const sourceElements = element.querySelectorAll('source');
    if (sourceElements.length) {
      return Array.from(sourceElements)
        .map(el => mapToFullInfo(el.getAttribute('srcset') || ''));
    }
    return mapToFullInfo();
  }

  const style = window.getComputedStyle(element) as any;
  return imageStyleProperties.map((key: string) => style[key])
    .filter(isImageURL)
    .map(url => mapToFullInfo(url));
}

function extractVideoFromElement(element: Element) {
  if (element.tagName.toLowerCase() === 'video') {
    const sourceElements = element.querySelectorAll('source');
    if (sourceElements.length) {
      return Array.from(sourceElements)
        .map(el => {
          const src = getSrcFromElement(el);
          return mapToFullInfo(src, getPosterFromVideoElement(element));
        });
    }
    const src = getSrcFromElement(element);
    return mapToFullInfo(src, getPosterFromVideoElement(element));
  }

  if (element.tagName.toLowerCase() === 'a') {
    const href = (element as HTMLAnchorElement).href;
    if (isVideoURL(href)) {
      return mapToFullInfo(href, null);
    }
  }

  if (element.tagName.toLowerCase() === 'object') {
    const data = (element as HTMLAnchorElement).getAttribute('data') || '';
    if (isVideoURL(data)) {
      return mapToFullInfo(data);
    }
  }

  if (element.tagName.toLowerCase() === 'embed') {
    const src = (element as HTMLAnchorElement).getAttribute('src') || '';
    if (isVideoURL(src)) {
      return mapToFullInfo(src);
    }
  }
  return mapToFullInfo('', null);
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

  if (element.tagName.toLowerCase() === 'object') {
    const data = (element as HTMLAnchorElement).getAttribute('data') || '';
    if (isAudioURL(data)) {
      return mapToFullInfo(data);
    }
  }

  if (element.tagName.toLowerCase() === 'embed') {
    const src = (element as HTMLAnchorElement).getAttribute('src') || '';
    if (isAudioURL(src)) {
      return mapToFullInfo(src);
    }
  }
  return mapToFullInfo();
}

function extractURLFromStyle(style: string) {
  const urlMatch = style.match(/url\(["']?(.*?)["']?\)/);
  return urlMatch ? urlMatch[1] : '';
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

export function extractDataFromTags(selectors: string, mapFn: (el: Element) => any) {
  const elements = [...qAll(selectors)];
  return elements.map(mapFn)
    .flat()
    .filter(isNotEmpty)
    .filter(isNotYouTubeLink);
}

export function extractImagesFromTags() {
  return extractDataFromTags('img, a, [style], picture, object, embed', extractImageFromElement);
}

export function extractVideosFromTags() {
  return extractDataFromTags('video, a, object, embed', extractVideoFromElement);
}

export function extractAudiosFromTags() {
  return extractDataFromTags('audio, a, object, embed', extractAudioFromElement);
}

export function extractImagesFromStyles() {
  const styleSheetImages = (Array.from(document.styleSheets) as CSSStyleSheet[])
    .filter(styleSheet => {
      try {
        return styleSheet.cssRules;
      } catch (e: any) {
        return false;
      }
    })
    .map(({cssRules}) => Array.from(cssRules))
    .flat()
    .filter(val => !!val)
    .filter((cssRule: any) => cssRule.style)
    .map((cssRule: any) => cssRule.style)
    .map((style: any) => [style.backgroundImage, style.background, style.maskImage, style.mask])
    .flat()
    .filter(val => !!val)
    .map((value: string) => extractURLFromStyle(value))
    .filter((url: NullableString) => !!url)
    .filter((url: string) => isImageURL(url))
    .filter((item, index, array) => array.indexOf(item) === index)
    .map((url: string) => mapToFullInfo(url));

  const pseudoElementImages = Array.from(document.querySelectorAll('*'))
    .flatMap((element) => {
      const beforeStyle = window.getComputedStyle(element, '::before');
      const afterStyle = window.getComputedStyle(element, '::after');

      const images = [beforeStyle, afterStyle]
        .map((style: any) => {
          const arr: string[] = [];
          imageStyleProperties.forEach(prop => arr.push(style[prop] as string));
          return arr;
        })
        .flat()
        .map(value => extractURLFromStyle(value))
        .filter(val => !!val)
        .filter((item, index, array) => array.indexOf(item) === index);

      return images.filter((url) => !!url && isImageURL(url));
    })
    .map((url: string) => mapToFullInfo(url));

  // Łączymy oba zestawy
  return [...styleSheetImages, ...pseudoElementImages];
}

