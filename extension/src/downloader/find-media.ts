import {NullableNumber} from '../types/common.type';
import {executeContentScript} from '../utils/chrome-api';

export function findMedia(tabId: NullableNumber = null) {
  executeContentScript('/dist/content-script/send_media/send_media.bundle.js', tabId);
}

export function findMediaQuickToDownload(tabId: NullableNumber = null) {
  executeContentScript('/dist/content-script/quick_send_media/quick_send_media.bundle.js', tabId);
}
