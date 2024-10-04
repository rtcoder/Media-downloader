import {executeContentScript} from '../utils/chrome-api';

export function findMedia(tabId: number | null = null) {
  executeContentScript('/dist/content-script/send_media.bundle.js', tabId);
}
