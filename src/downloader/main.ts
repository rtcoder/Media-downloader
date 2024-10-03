import {getStorageValue} from '../utils/chrome-api';
import {show} from '../utils/dom-functions';
import {setDomListeners} from './dom-listeners';
import {findMedia} from './find-media';
import {setMessageListeners} from './message-listeners';


function init() {
  findMedia();
  setMessageListeners();
  setDomListeners();
  getStorageValue({showChangelogLink: false}, result => {
    if (result.showChangelogLink) {
      show('.changelog-link');
    }
  });
}

init();
