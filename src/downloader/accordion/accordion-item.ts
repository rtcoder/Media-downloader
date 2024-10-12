import {getAllMediaToDisplay, isTabExpanded} from '../../media-display';
import {MediaItem} from '../../types/media-in-tabs.type';
import {TabData} from '../../types/tab-data.type';
import {
  createButtonElement,
  createDivElement,
  createElement,
  createImgElement,
  createSpanElement,
} from '../../utils/dom-functions';
import {getCurrentSection, sortOrderAsc} from '../../utils/utils';
import {applyFilters} from '../filters/filter-fn';
import {getGridItem} from './grid-item';

function getAccordionHeader(accordionItem: HTMLElement, favicon: string, name: string, filteredMediaToDisplay: MediaItem[]) {
  const unfilteredCount = filteredMediaToDisplay.length;
  const filteredCount = filteredMediaToDisplay.filter(item => item.display).length;
  const count = filteredCount === unfilteredCount
    ? `(${filteredCount})`
    : `(${filteredCount} / ${unfilteredCount})`;

  accordionItem.hidden = filteredCount === 0;

  const existingHeader = accordionItem.querySelector('.accordion-header') as HTMLElement;
  if (existingHeader) {
    existingHeader.querySelector('.tab-media-count')!.innerHTML = count;
    return existingHeader;
  }
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

function getYtRestrictionInfo(body: HTMLElement) {
  const info = body.querySelector('.yt-info') as HTMLElement;
  if (info) {
    return info;
  }
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

function getAccordionBody(accordionItem: HTMLElement, items: MediaItem[], tabId: number, tabUuid: string, restricted: boolean) {
  const existingBody = accordionItem.querySelector('.accordion-body') as HTMLElement;
  const body = existingBody
    ? existingBody
    : createDivElement({class: 'accordion-body'});

  if (!restricted) {
    body.querySelectorAll('.grid-item')
      .forEach((gridItem: any) => gridItem.hidden = true);

    const children = items.sort(sortOrderAsc)
      .map(item => getGridItem(body, item));

    body.append(...children);
  } else {
    body.appendChild(getYtRestrictionInfo(body));
    body.classList.add('restricted');
  }

  return body;
}

export function getAccordionItem(tabData: TabData, accordionItem: HTMLElement) {
  const {title, uuid, id, favIconUrl, isRestricted} = tabData;
  const type = getCurrentSection();
  const mediaToDisplay = getAllMediaToDisplay(uuid);
  const filteredMediaToDisplay = applyFilters(type, mediaToDisplay);

  const expanded = isTabExpanded(uuid);
  const item = accordionItem
    ? accordionItem
    : createDivElement({class: ['accordion-item', ...(expanded ? ['active'] : [])]});
  item.setAttribute('tab-uuid', uuid);
  item.classList.remove('first-item');

  const header = getAccordionHeader(item, favIconUrl, title, filteredMediaToDisplay);
  const body = getAccordionBody(item, filteredMediaToDisplay, id, uuid, isRestricted);
  item.appendChild(header);
  item.appendChild(body);
  return item;
}
