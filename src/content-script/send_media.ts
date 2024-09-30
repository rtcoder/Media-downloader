import {MediaItem} from '../types/media-display.type';
import {MessageEventNameEnum} from '../types/message-event-name.enum';
import {sendMessage} from '../utils/chrome-api';
import {
  extractAudiosFromTags,
  extractImagesFromStyles,
  extractImagesFromTags,
  extractVideosFromTags,
} from './extractors-fn';
import {mapToFinalResultArray} from './mappers-fn';

(() => {
  async function gatherMedia() {
    let error = null;
    let images: MediaItem[] = [];
    let videos: MediaItem[] = [];
    let audios: MediaItem[] = [];

    try {
      const imagesFromTags = await extractImagesFromTags();
      const imagesFromStyles = extractImagesFromStyles();
      images = mapToFinalResultArray([...imagesFromTags, ...imagesFromStyles]);

      const videosFromTags = await extractVideosFromTags();
      videos = mapToFinalResultArray(videosFromTags);

      const audiosFromTags = await extractAudiosFromTags();
      audios = mapToFinalResultArray(audiosFromTags);
    } catch (err: any) {
      console.log({err});
      error = {...err};
    }

    sendMessage(MessageEventNameEnum.SEND_MEDIA, {
      error,
      image:images,
      audio:audios,
      video:videos,
    });
  }

  gatherMedia();

})();
