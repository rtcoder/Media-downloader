import {setDomListeners} from './dom-listeners';
import {findMedia} from './find-media';
import {setMessageListeners} from './message-listeners';


function init() {
  findMedia();
  setMessageListeners();
  setDomListeners();
}

init();
