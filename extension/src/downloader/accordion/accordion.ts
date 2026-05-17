import {tabCollections} from '../../media-in-tabs';
import {q} from '../../utils/dom-functions';
import {getAccordionGroup} from './accordion-group';


export function updateAccordionData() {
  const accordion = q('.accordion');
  tabCollections.forEach(tabId => {
    const group = accordion.querySelector(`[data-tab-subgroup="${tabId}"]`) as HTMLElement;
    accordion.appendChild(getAccordionGroup(tabId, group));
  });
}
