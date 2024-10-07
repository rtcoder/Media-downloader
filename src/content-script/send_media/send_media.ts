import {NullableChromeTab} from '../../types/chrome.type';
import {FoundMedia} from '../../types/found-media.type';
import {ItemTypeEnum, MediaItem} from '../../types/media-in-tabs.type';
import {MessageEventNameEnum} from '../../types/message-event-name.enum';
import {sendMessage} from '../../utils/chrome-api';
import {createElement, createImgElement} from '../../utils/dom-functions';
import {formatTime, getQualityLabel} from '../../utils/utils';
import {
  extractAudiosFromTags,
  extractImagesFromStyles,
  extractImagesFromTags,
  extractVideosFromTags,
} from '../extractors-fn';
import {mapToFinalResultArray} from '../mappers-fn';

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
      const imagesFromTags = extractImagesFromTags();
      const imagesFromStyles = extractImagesFromStyles();
      images = await mapToFinalResultArray([...imagesFromTags, ...imagesFromStyles], ItemTypeEnum.IMAGE);

      const videosFromTags = extractVideosFromTags();
      videos = await mapToFinalResultArray(videosFromTags, ItemTypeEnum.VIDEO);

      const audiosFromTags = extractAudiosFromTags();
      audios = await mapToFinalResultArray(audiosFromTags, ItemTypeEnum.AUDIO);
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
