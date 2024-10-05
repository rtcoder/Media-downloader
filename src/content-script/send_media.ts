import {NullableChromeTab} from '../types/chrome.type';
import {FoundMedia} from '../types/found-media.type';
import {MediaItem} from '../types/media-in-tabs.type';
import {MessageEventNameEnum} from '../types/message-event-name.enum';
import {sendMessage} from '../utils/chrome-api';
import {createElement, createImgElement} from '../utils/dom-functions';
import {formatTime, getQualityLabel} from '../utils/utils';
import {
  extractAudiosFromTags,
  extractImagesFromStyles,
  extractImagesFromTags,
  extractVideosFromTags,
} from './extractors-fn';
import {mapToFinalResultArray} from './mappers-fn';

(() => {

  function sendMedia(
    images: MediaItem[],
    audios: MediaItem[],
    videos: MediaItem[],
    tab: NullableChromeTab,
    error: any = null,
  ) {
    sendMessage(MessageEventNameEnum.SEND_MEDIA, {
      error,
      image: images,
      audio: audios,
      video: videos,
      tabInfo: tab,
    } as FoundMedia);
  }

  async function gatherMedia(tab: NullableChromeTab) {
    let error = null;
    let images: MediaItem[] = [];
    let videos: MediaItem[] = [];
    let audios: MediaItem[] = [];

    try {
      const imagesFromTags = await extractImagesFromTags();
      const imagesFromStyles = await extractImagesFromStyles();
      images = mapToFinalResultArray([...imagesFromTags, ...imagesFromStyles]);

      const videosFromTags = await extractVideosFromTags();
      videos = mapToFinalResultArray(videosFromTags);

      const audiosFromTags = await extractAudiosFromTags();
      audios = mapToFinalResultArray(audiosFromTags);
    } catch (err: any) {
      console.log({err});
      error = {...err};
    }
    if (error) {
      sendMedia([], [], [], tab, error);
      return;
    }
    images.forEach(img => {
      const imgEl = createImgElement();
      imgEl.addEventListener('load', () => {
        img.properties.width = imgEl.naturalWidth;
        img.properties.height = imgEl.naturalHeight;
        imgEl.remove();
        sendMedia([img], [], [], tab);
      });
      imgEl.src = img.src;
    });
    videos.forEach(video => {
      const videoEl = createElement('video');
      videoEl.addEventListener('loadedmetadata', () => {
        video.properties.quality = getQualityLabel(videoEl.videoWidth);
        videoEl.remove();
        sendMedia([], [], [video], tab);
      });
      videoEl.src = video.src;
    });
    audios.forEach(audio => {
      const audioEl = createElement('audio');
      audioEl.addEventListener('loadedmetadata', () => {
        const duration = formatTime(audioEl.duration);
        audio.properties.duration = audioEl.duration;
        audio.properties.durationStr = duration;
        audioEl.remove();
        sendMedia([], [audio], [], tab);
      });
      audioEl.src = audio.src;
    });

  }

  sendMessage(MessageEventNameEnum.GET_TAB_INFO, {}, (tab: NullableChromeTab) => {
    gatherMedia(tab);
  });

})();
