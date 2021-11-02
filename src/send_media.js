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
        return {src: imageDownloader.getSrcFromElement(element)};
      }

      if (element.tagName.toLowerCase() === 'a') {
        const href = element.href;
        if (imageDownloader.isImageURL(href)) {
          return {src: href};
        }
      }

      const backgroundImage = window.getComputedStyle(element).backgroundImage;
      if (backgroundImage) {
        const parsedURL = imageDownloader.extractURLFromStyle(backgroundImage);
        if (imageDownloader.isImageURL(parsedURL)) {
          return {src: parsedURL};
        }
      }

      return {src: ''};
    },
    extractVideoFromElement(element) {
      if (element.tagName.toLowerCase() === 'video') {
        console.log('video');
        return {
          src: imageDownloader.getSrcFromElement(element),
          poster: imageDownloader.getPosterFromVideoElement(element)
        };
      }

      if (element.tagName.toLowerCase() === 'a') {
        const href = element.href;
        if (imageDownloader.isVideoURL(href)) {
          return {
            src: href,
            poster: null
          };
        }
      }
      return {src: '', poster: null};
    },
    extractAudioFromElement(element) {
      if (element.tagName.toLowerCase() === 'audio') {
        return {src: imageDownloader.getSrcFromElement(element)};
      }

      if (element.tagName.toLowerCase() === 'a') {
        const href = element.href;
        if (imageDownloader.isAudioURL(href)) {
          return {src: href};
        }
      }
      return {src: ''};
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

    getPosterFromVideoElement(element) {
      let poster = element.getAttribute('poster');
      const hashIndex = poster.indexOf('#');
      if (hashIndex >= 0) {
        poster = poster.substr(0, hashIndex);
      }
      return poster;
    },

    removeDuplicateOrEmpty(data) {

      let result = [...new Map(data.map(item =>
          [item.src, item])).values()];

      result = result.filter(({src}) => !!src);


      return result;
    },
  };
  try {
    imageDownloader.images = imageDownloader.removeDuplicateOrEmpty([
          ...imageDownloader.extractImagesFromTags(),
          ...imageDownloader.extractImagesFromStyles()
        ].map(({src}) => {
          return {
            src: imageDownloader.relativeUrlToAbsolute(src)
          };
        })
    );
    imageDownloader.videos = imageDownloader.removeDuplicateOrEmpty(
        imageDownloader.extractVideosFromTags()
            .map(({src, poster}) => {
              return {
                src: imageDownloader.relativeUrlToAbsolute(src),
                poster: poster ? imageDownloader.relativeUrlToAbsolute(poster) : null
              };
            })
    );

    imageDownloader.audios = imageDownloader.removeDuplicateOrEmpty(
        imageDownloader.extractAudiosFromTags()
            .map(({src}) => {
              return {
                src: imageDownloader.relativeUrlToAbsolute(src)
              };
            })
    );
  } catch (err) {
    console.log({err});
    imageDownloader.error = {...err};
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
