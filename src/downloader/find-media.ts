import {executeContentScript} from '../utils/chrome-api';

export function findMedia() {
  executeContentScript('/dist/content-script/send_media.bundle.js');
}
