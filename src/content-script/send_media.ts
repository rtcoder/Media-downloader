import {NullableChromeTab} from '../types/chrome.type';
import {FoundMedia} from '../types/found-media.type';
import {MediaItem} from '../types/media-in-tabs.type';
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
  async function gatherMedia(tab: NullableChromeTab) {
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
      image: images,
      audio: audios,
      video: videos,
      tabInfo: tab,
    } as FoundMedia);
  }

  sendMessage(MessageEventNameEnum.GET_TAB_INFO, {}, (tab: NullableChromeTab) => {
    gatherMedia(tab);
  });

})();
