import {getLastOpenSectionValue, getShowChangeLogLinkValue} from '../storage/storage-fn';
import {show} from '../utils/dom-functions';
import {selectSection, setDomListeners} from './dom-listeners';
import {initFilters} from './filters/filters';
import {findMedia} from './find-media';
import {setMessageListeners} from './message-listeners';


function init() {
  findMedia();
  setMessageListeners();
  setDomListeners();
  initFilters();
  getShowChangeLogLinkValue(showChangelogLink => {
    if (showChangelogLink) {
      show('.changelog-link');
    }
  });
  getLastOpenSectionValue(lastOpenSection => {
    selectSection(lastOpenSection);
  });
}

init();
