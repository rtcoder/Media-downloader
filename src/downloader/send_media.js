(() => {
    const imageRegex = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:bmp|gif|jpe?g|png|svg|webp))(?:\?([^#]*))?(?:#(.*))?/i;
    const videoRegex = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:mkv|flv|ogg|ogv|gifv|avi|mov|wmv|rm|rmvb|mp4|m4p|m4v|mpg|mpeg|3gp|3g2|webm))(?:\?([^#]*))?(?:#(.*))?/i;
    const audioRegex = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:mp3|flac|ogg|wma))(?:\?([^#]*))?(?:#(.*))?/i;

    /**
     * Extracts images from elements in the document asynchronously.
     *
     * @returns {Promise<Array>} - A promise that resolves to an array of extracted images.
     */
    async function extractImagesFromTags() {
        const elements = [...document.querySelectorAll('img, a, [style]')];

        // Create an array of Promises using map
        const promises = elements.map(el => extractImageFromElement(el));

        // Wait for all Promises to resolve
        const results = await Promise.all(promises);

        // Process the results further after all Promises are resolved
        return results
            .filter(isNotEmpty)
            .filter(isNotYouTubeLink);
    }

    /**
     * Extracts videos from elements in the document asynchronously.
     *
     * @returns {Promise<Array>} - A promise that resolves to an array of extracted videos.
     */
    async function extractVideosFromTags() {
        const elements = [...document.querySelectorAll('video, a')];

        // Create an array of Promises using map
        const promises = elements.map(el => extractVideoFromElement(el));

        // Wait for all Promises to resolve
        const results = await Promise.all(promises);

        // Process the results further after all Promises are resolved
        return results
            .filter(isNotEmpty)
            .filter(isNotYouTubeLink);
    }

    /**
     * Extracts audios from elements in the document asynchronously.
     *
     * @returns {Promise<Array>} - A promise that resolves to an array of extracted audios.
     */
    async function extractAudiosFromTags() {
        const elements = [...document.querySelectorAll('audio, a')];

        // Create an array of Promises using map
        const promises = elements.map(el => extractAudioFromElement(el));

        // Wait for all Promises to resolve
        const results = await Promise.all(promises);

        // Process the results further after all Promises are resolved
        return results
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

    async function extractImageFromElement(element) {
        if (element.tagName.toLowerCase() === 'img') {
            const src = getSrcFromElement(element);
            return {
                src,
                type: await getFileType(src),
            };
        }

        if (element.tagName.toLowerCase() === 'a') {
            const href = element.href;
            if (isImageURL(href)) {
                return {
                    src: href,
                    type: await getFileType(href),
                };
            }
        }

        const backgroundImage = window.getComputedStyle(element).backgroundImage;
        if (backgroundImage) {
            const parsedURL = extractURLFromStyle(backgroundImage);
            if (isImageURL(parsedURL)) {
                return {
                    src: parsedURL,
                    type: await getFileType(parsedURL),
                };
            }
        }

        return {src: '', type: null};
    }

    async function extractVideoFromElement(element) {
        if (element.tagName.toLowerCase() === 'video') {
            const sourceElement = element.querySelector('source');
            const src = sourceElement
                ? getSrcFromElement(sourceElement)
                : getSrcFromElement(element);
            return {
                src,
                poster: getPosterFromVideoElement(element),
                type: await getFileType(src),
            };
        }

        if (element.tagName.toLowerCase() === 'a') {
            const href = element.href;
            if (isVideoURL(href)) {
                return {
                    src: href,
                    poster: null,
                    type: await getFileType(href),
                };
            }
        }
        return {src: '', poster: null, type: null};
    }

    async function extractAudioFromElement(element) {
        if (element.tagName.toLowerCase() === 'audio') {
            const sourceElement = element.querySelector('source');
            const src = sourceElement
                ? getSrcFromElement(sourceElement)
                : getSrcFromElement(element);
            return {
                src,
                type: await getFileType(src),
            };
        }

        if (element.tagName.toLowerCase() === 'a') {
            const href = element.href;
            if (isAudioURL(href)) {
                return {
                    src: href,
                    type: await getFileType(href),
                };
            }
        }
        return {src: '', type: null};
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
        if (url === null) {
            return null;
        }
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
        let poster = element.getAttribute('poster')
            || element.getAttribute('data-poster');
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

    function getFileTypeFromBase64(base64String) {
        const match = base64String.match(/^data:(.+);base64,/);
        const ext = match ? match[1].split('/')[1] : null;
        if (ext?.startsWith('svg+xml')) {
            return 'svg';
        }
        return ext;
    }

    function getFileTypeFromUrl(url) {
        const lastUrlSegment = url.split('/').pop();
        if (!lastUrlSegment.includes('.')) {
            return null;
        }
        return lastUrlSegment.split('.').pop().toLowerCase().split('?')[0];
    }

    /**
     * Determines the file type based on the input string (URL or Base64).
     * If the input is a URL without an extension, it attempts to fetch the Content-Type from the server.
     *
     * @param {string|null} urlOrBase64 - The input string, which can be either a URL or a Base64 encoded string.
     * @returns {Promise<string|null>} - A promise that resolves with the file type (e.g., 'jpg', 'mp4', etc.) or null if the type cannot be determined.
     */
    async function getFileType(urlOrBase64) {
        if (urlOrBase64 === null) {
            return null;
        }
        const base64Pattern = /^data:(.+);base64,/;
        let filetype = '';

        if (base64Pattern.test(urlOrBase64)) {
            filetype = getFileTypeFromBase64(urlOrBase64);
        } else {
            const extension = getFileTypeFromUrl(urlOrBase64);
            if (extension) {
                filetype = extension;
            } else {
                try {
                    filetype = await getFileTypeFromUrlHeaders(urlOrBase64);
                } catch (e) {
                    filetype = 'png';
                }
            }
        }

        return filetype || 'png';
    }

    /**
     * Fetches the Content-Type header from the server for a given URL to determine the file type.
     *
     * @param {string} url - The URL string.
     * @returns {Promise<string|null>} - A promise that resolves with the file type (e.g., 'jpeg', 'png', etc.) or null if it cannot be determined.
     */
    async function getFileTypeFromUrlHeaders(url) {
        try {
            const response = await fetch(url, {method: 'HEAD', referrer: window.location.origin});
            const contentType = response.headers.get('Content-Type');

            if (contentType) {
                const type = contentType.split('/')[1];
                if (type.startsWith('svg+xml')) {
                    return 'svg';
                }
            }
        } catch (error) {
            return 'png';
        }
        return null;
    }

    /**
     * Gathers images, videos, and audios from the current document and sends them via `chrome.runtime.sendMessage`.
     */
    async function gatherMedia() {
        const result = {
            error: null,
            images: null,
            videos: null,
            audios: null,
        };

        try {
            // Gather images
            const imagesFromTags = await extractImagesFromTags();
            const imagesFromStyles = extractImagesFromStyles(); // Assuming this is synchronous
            result.images = removeDuplicateOrEmpty(
                [...imagesFromTags, ...imagesFromStyles].map(({src, type}) => ({
                    src: relativeUrlToAbsolute(src),
                    type,
                })),
            );

            // Gather videos
            const videosFromTags = await extractVideosFromTags();
            result.videos = removeDuplicateOrEmpty(
                videosFromTags.map(({src, type, poster}) => ({
                    src: relativeUrlToAbsolute(src),
                    poster: poster ? relativeUrlToAbsolute(poster) : null,
                    type,
                })),
            );

            // Gather audios
            const audiosFromTags = await extractAudiosFromTags();
            result.audios = removeDuplicateOrEmpty(
                audiosFromTags.map(({src, type}) => ({
                    src: relativeUrlToAbsolute(src),
                    type,
                })),
            );
        } catch (err) {
            console.log({err});
            result.error = {...err};
        }

        chrome.runtime.sendMessage({...result});

        // Reset the result object
        result.images = null;
        result.error = null;
        result.videos = null;
        result.audios = null;
    }

// Invoke the async function to gather media
    gatherMedia();

})();
