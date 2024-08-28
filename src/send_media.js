(() => {
    const imageRegex = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:bmp|gif|jpe?g|png|svg|webp))(?:\?([^#]*))?(?:#(.*))?/i;
    const videoRegex = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:mkv|flv|ogg|ogv|gifv|avi|mov|wmv|rm|rmvb|mp4|m4p|m4v|mpg|mpeg|3gp|3g2|webm))(?:\?([^#]*))?(?:#(.*))?/i;
    const audioRegex = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:mp3|flac|ogg|wma))(?:\?([^#]*))?(?:#(.*))?/i;


    function extractImagesFromTags() {
        console.log(document);
        return [...document.querySelectorAll('img, a, [style]')]
            .map(extractImageFromElement)
            .filter(isNotEmpty)
            .filter(isNotYouTubeLink);
    }

    function extractVideosFromTags() {
        return [...document.querySelectorAll('video, a')]
            .map(extractVideoFromElement)
            .filter(isNotEmpty)
            .filter(isNotYouTubeLink);
    }

    function extractAudiosFromTags() {
        return [...document.querySelectorAll('audio, a')]
            .map(extractAudioFromElement)
            .filter(isNotEmpty)
            .filter(isNotYouTubeLink);
    }

    function extractImagesFromStyles() {
        return [...document.styleSheets]
            .filter(styleSheet => !!styleSheet.hasOwnProperty('cssRules'))
            .map(({cssRules}) => [...cssRules])
            .flat()
            .filter(({style}) => style && style.backgroundImage)
            .map(({style}) => extractURLFromStyle(style.backgroundImage))
            .filter(url => !!url)
            .filter(url => !!isImageURL(url));
    }

    function extractImageFromElement(element) {
        if (element.tagName.toLowerCase() === 'img') {
            return {src: getSrcFromElement(element)};
        }

        if (element.tagName.toLowerCase() === 'a') {
            const href = element.href;
            if (isImageURL(href)) {
                return {src: href};
            }
        }

        const backgroundImage = window.getComputedStyle(element).backgroundImage;
        if (backgroundImage) {
            const parsedURL = extractURLFromStyle(backgroundImage);
            if (isImageURL(parsedURL)) {
                return {src: parsedURL};
            }
        }

        return {src: ''};
    }

    function extractVideoFromElement(element) {
        if (element.tagName.toLowerCase() === 'video') {
            console.log('video');
            return {
                src: getSrcFromElement(element),
                poster: getPosterFromVideoElement(element),
            };
        }

        if (element.tagName.toLowerCase() === 'a') {
            const href = element.href;
            if (isVideoURL(href)) {
                return {
                    src: href,
                    poster: null,
                };
            }
        }
        return {src: '', poster: null};
    }

    function extractAudioFromElement(element) {
        if (element.tagName.toLowerCase() === 'audio') {
            return {src: getSrcFromElement(element)};
        }

        if (element.tagName.toLowerCase() === 'a') {
            const href = element.href;
            if (isAudioURL(href)) {
                return {src: href};
            }
        }
        return {src: ''};
    }

    function extractURLFromStyle(url) {
        return url.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
    }

    function isNotYouTubeLink({src}) {
        return !src.includes('https://www.youtube.com')
            && !src.includes('https://www.youtu.be')
            && !src.includes('https://youtube.com')
            && !src.includes('https://youtu.be');
    }

    function isNotEmpty({src}) {
        return !!src;
    }

    function isImageURL(url) {
        return url.startsWith('data:image') || imageRegex.test(url);
    }

    function isVideoURL(url) {
        return url.startsWith('data:video') || videoRegex.test(url);
    }

    function isAudioURL(url) {
        return url.startsWith('data:audio') || audioRegex.test(url);
    }

    function relativeUrlToAbsolute(url) {
        return url.startsWith('/') ? `${window.location.origin}${url}` : url;
    }

    function getSrcFromElement(element) {
        let src = element.getAttribute('src');
        const hashIndex = src?.indexOf('#');
        if (hashIndex >= 0) {
            src = src.substring(0, hashIndex + 1);
        }
        return src;
    }

    function getPosterFromVideoElement(element) {
        let poster = element.getAttribute('poster');
        const hashIndex = poster?.indexOf('#');
        if (hashIndex >= 0) {
            poster = poster.substring(0, hashIndex + 1);
        }
        return poster;
    }

    function removeDuplicateOrEmpty(data) {

        let result = [...new Map(data.map(item => [item.src, item])).values()];

        result = result.filter(({src}) => !!src);

        return result;
    }

    const result = {
        error: null,
        images: null,
        videos: null,
        audios: null,
    };

    // try {
    result.images = removeDuplicateOrEmpty([
            ...extractImagesFromTags(),
            ...extractImagesFromStyles(),
        ].map(({src}) => ({
            src: relativeUrlToAbsolute(src),
        })),
    );

    result.videos = removeDuplicateOrEmpty(
        extractVideosFromTags().map(({src, poster}) => ({
            src: relativeUrlToAbsolute(src),
            poster: poster ? relativeUrlToAbsolute(poster) : null,
        })),
    );

    result.audios = removeDuplicateOrEmpty(
        extractAudiosFromTags().map(({src}) => ({
            src: relativeUrlToAbsolute(src),
        })),
    );
    // } catch (err) {
    //     console.log({err});
    //     result.error = {...err};
    // }
console.log(result)
    chrome.runtime.sendMessage({...result});

    result.images = null;
    result.error = null;
    result.videos = null;
    result.audios = null;
})();
