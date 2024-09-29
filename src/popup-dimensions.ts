import {DefaultActionType} from './storage/storage-def';
import {getStorageDefaultActionValue} from './storage/storage-fn';
import {q} from './utils/dom-functions';

getStorageDefaultActionValue((defaultAction) => {
  switch (defaultAction) {
    case DefaultActionType.POPUP:
      const html = q('html');
      html.style.width = '710px';
      html.style.height = '530px';
      break;
  }
});
