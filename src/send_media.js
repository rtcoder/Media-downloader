(() => {
  const imageDownloader = {
    imageRegex: /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:bmp|gif|jpe?g|png|svg|webp))(?:\?([^#]*))?(?:#(.*))?/i,
    videoRegex: /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:mkv|flv|ogg|ogv|gifv|avi|mov|wmv|rm|rmvb|mp4|m4p|m4v|mpg|mpeg|3gp|3g2|webm))(?:\?([^#]*))?(?:#(.*))?/i,
    audioRegex: /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:mp3|flac|ogg|wma))(?:\?([^#]*))?(?:#(.*))?/i,

    extractImagesFromTags() {
      return [...document.querySelectorAll('img, a, [style]')]
          .map(imageDownloader.extractImageFromElement);
    },
    extractVideosFromTags() {
      return [...document.querySelectorAll('video, a')]
          .map(imageDownloader.extractVideoFromElement);
    },
    extractAudiosFromTags() {
      return [...document.querySelectorAll('audio, a')]
          .map(imageDownloader.extractAudioFromElement);
    },

    extractImagesFromStyles() {
      return [...document.styleSheets]
          .filter(styleSheet => !!styleSheet.hasOwnProperty('cssRules'))
          .map(({cssRules}) => [...cssRules])
          .flat()
          .filter(({style}) => style && style.backgroundImage)
          .map(({style}) => imageDownloader.extractURLFromStyle(style.backgroundImage))
          .filter(url => !!imageDownloader.isImageURL(url));
    },

    extractImageFromElement(element) {
      if (element.tagName.toLowerCase() === 'img') {
        return imageDownloader.getSrcFromElement(element);
      }

      if (element.tagName.toLowerCase() === 'a') {
        const href = element.href;
        if (imageDownloader.isImageURL(href)) {
          return href;
        }
      }

      const backgroundImage = window.getComputedStyle(element).backgroundImage;
      if (backgroundImage) {
        const parsedURL = imageDownloader.extractURLFromStyle(backgroundImage);
        if (imageDownloader.isImageURL(parsedURL)) {
          return parsedURL;
        }
      }

      return '';
    },
    extractVideoFromElement(element) {
      if (element.tagName.toLowerCase() === 'video') {
        return imageDownloader.getSrcFromElement(element);
      }

      if (element.tagName.toLowerCase() === 'a') {
        const href = element.href;
        if (imageDownloader.isVideoURL(href)) {
          return href;
        }
      }
      return '';
    },
    extractAudioFromElement(element) {
      if (element.tagName.toLowerCase() === 'audio') {
        return imageDownloader.getSrcFromElement(element);
      }

      if (element.tagName.toLowerCase() === 'a') {
        const href = element.href;
        if (imageDownloader.isAudioURL(href)) {
          return href;
        }
      }
      return '';
    },

    extractURLFromStyle(url) {
      return url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    },

    isImageURL(url) {
      return url.indexOf('data:image') === 0 || imageDownloader.imageRegex.test(url);
    },
    isVideoURL(url) {
      return url.indexOf('data:video') === 0 || imageDownloader.videoRegex.test(url);
    },
    isAudioURL(url) {
      return url.indexOf('data:audio') === 0 || imageDownloader.audioRegex.test(url);
    },

    relativeUrlToAbsolute(url) {
      return url.indexOf('/') === 0 ? `${window.location.origin}${url}` : url;
    },

    getSrcFromElement(element) {
      let src = element.src;
      const hashIndex = src.indexOf('#');
      if (hashIndex >= 0) {
        src = src.substr(0, hashIndex);
      }
      return src;
    },

    removeDuplicateOrEmpty(images) {
      const hash = {};
      for (let i = 0; i < images.length; i++) {
        hash[images[i]] = 0;
      }
      const result = [];
      for (let key in hash) {
        if (key !== '') {
          result.push(key);
        }
      }

      return result;
    },
  };
  try {
    imageDownloader.images = imageDownloader.removeDuplicateOrEmpty([
          ...imageDownloader.extractImagesFromTags(),
          ...imageDownloader.extractImagesFromStyles()
        ].map(imageDownloader.relativeUrlToAbsolute)
    );
    imageDownloader.videos = imageDownloader.removeDuplicateOrEmpty(
        imageDownloader.extractVideosFromTags()
            .map(imageDownloader.relativeUrlToAbsolute)
    );

    imageDownloader.audios = imageDownloader.removeDuplicateOrEmpty(
        imageDownloader.extractAudiosFromTags()
            .map(imageDownloader.relativeUrlToAbsolute)
    );
  } catch (err) {
    imageDownloader.error = err;
  }

  chrome.runtime.sendMessage({
    error: imageDownloader.error,
    images: imageDownloader.images,
    videos: imageDownloader.videos,
    audios: imageDownloader.audios,
  });

  imageDownloader.images = null;
  imageDownloader.error = null;
  imageDownloader.videos = null;
  imageDownloader.audios = null;
})();
