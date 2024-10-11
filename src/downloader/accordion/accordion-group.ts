import {getTabsFromCollection} from '../../media-in-tabs';
import {createDivElement} from '../../utils/dom-functions';
import {getAccordionItem} from './accordion-item';

export function getAccordionGroup(tabId: number, groupDiv: HTMLElement) {
  if (!groupDiv) {
    groupDiv = createDivElement({
      class: 'accordion-group',
      attributes: {
        'data-tab-subgroup': tabId,
      },
    }) as HTMLElement;
  }
  getTabsFromCollection(tabId).forEach(tabData => {
    const accordionItem = groupDiv.querySelector(`[tab-uuid="${tabData.uuid}"]`) as HTMLElement;
    groupDiv.appendChild(getAccordionItem(tabData, accordionItem));
  });

  return groupDiv;
}
