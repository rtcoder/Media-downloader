import {FoundMediaQuick} from '../../types/found-media.type';
import {QuickMediaItem} from '../../types/media-in-tabs.type';
import {MessageEventNameEnum} from '../../types/message-event-name.enum';
import {sendMessage} from '../../utils/chrome-api';
import {
  extractAudiosFromTags,
  extractImagesFromStyles,
  extractImagesFromTags,
  extractVideosFromTags,
} from '../extractors-fn';
import {mapToFinalQuickResultArray} from './quick-send-media-mappers-fn';

(() => {
  function gatherMedia() {
    let error = null;
    let media: QuickMediaItem[] = [];

    try {
      const imagesFromTags = extractImagesFromTags();
      const imagesFromStyles = extractImagesFromStyles();
      const videosFromTags = extractVideosFromTags();
      const audiosFromTags = extractAudiosFromTags();
      media = mapToFinalQuickResultArray([
        ...imagesFromTags,
        ...imagesFromStyles,
        ...videosFromTags,
        ...audiosFromTags,
      ]);
    } catch (err: any) {
      console.log({err});
      error = {...err};
    }
    sendMessage(MessageEventNameEnum.QUICK_SEND_MEDIA_FOR_DOWNLOAD, {
      error,
      media,
    } as FoundMediaQuick);
  }

  gatherMedia();

})();
