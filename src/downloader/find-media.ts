import {NullableNumber} from '../types/common.type';
import {executeContentScript} from '../utils/chrome-api';

export function findMedia(tabId: NullableNumber = null) {
  executeContentScript('/dist/content-script/send_media.bundle.js', tabId);
}
