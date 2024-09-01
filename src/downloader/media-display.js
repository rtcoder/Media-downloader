/**
 * Represents a media item to display, including its type.
 * @typedef {Object} DisplayMediaItem
 * @property {string} src - The source URL of the media item.
 * @property {string} type - The type of the media item ('image', 'video', or 'audio').
 * @property {string|null} filetype - The type of the media item ('image', 'video', or 'audio').
 * @property {string|null} [poster] - The URL of the video's poster image (only for videos).
 */

/**
 * Represents a media item to display within a specific tab.
 * @typedef {Object} MediaToDisplayItem
 * @property {TabData} tab - The basic information about the tab.
 * @property {DisplayMediaItem[]} items - An array of media items to display.
 */

/**
 * Returns an array of media items to display based on the current section (images, videos, or audios).
 * The function processes the media content from all tabs and filters it according to the current section.
 *
 * @returns {MediaToDisplayItem[]} An array of objects containing tab information and the corresponding media items to display.
 */
function getAllMediaToDisplay() {
    const currentSection = getCurrentSection();
    const sectionMapping = {
        images: (media) => media.images.map(({type, src}) => ({src, filetype: type, type: 'image'})),
        videos: (media) => media.videos.map(({type, src, poster}) => ({src, poster, filetype: type, type: 'video'})),
        audios: (media) => media.audios.map(({type, src}) => ({src, filetype: type, type: 'audio'})),
    };

    const getMediaItems = sectionMapping[currentSection] || (() => []);

    return mediaInTabs.map(({media, tab}) => {
        const items = getMediaItems(media);
        return {tab, items};
    });
}

function displayMedia() {
    setDisabled('#download-btn', true);

    const mediaToDisplay = getAllMediaToDisplay();

    const dataTable = document.querySelector('.accordion');
    const countAll = document.querySelector('.count-all');
    dataTable.innerHTML = '';

    countAll.innerHTML = countAllMedia(mediaToDisplay).toString();

    dataTable.append(...mediaToDisplay.map(mediaGroup =>
        createDivElement({class: 'accordion-item', data: {'tab-id': mediaGroup.tab.id}}, [
            createDivElement({class: 'accordion-header'},
                createButtonElement({class: 'accordion-button'}, [
                    createImgElement({src: mediaGroup.tab.favIconUrl, alt: 'Favicon', class: 'favicon'}),
                    createSpanElement({class: 'tab-title'}, [
                        createSpanElement({class: 'title', html: mediaGroup.tab.title}),
                        createSpanElement({class: 'tab-media-count', html: `(${mediaGroup.items.length})`}),
                    ]),
                    createSpanElement({class: 'tab-toggle'}),
                ]),
            ),
            createDivElement({class: 'accordion-collapse'},
                createDivElement({class: ['accordion-body', 'grid']},
                    mediaGroup.items.map((mediaItem, itemIndex) =>
                        createDivElement({class: 'item'}, [
                            createButtonElement({class: 'download_image_button', data: {'src': mediaItem.src}}, createIconElement('download')),
                            createDivElement({class: 'item-details'}, [
                                createDivElement({class: 'item-details-ext', html: mediaItem.filetype}),
                                createDivElement({class: 'item-details-dimensions'}),
                            ]),
                            getThumbnail(mediaItem, `${mediaGroup.tab.id}-${itemIndex}`),
                        ]),
                    ),
                ),
            ),
        ]),
    ));
    dataTable.querySelectorAll('.thumbnail[data-src]').forEach(el => {
        console.log(el)
        el.src = el.getAttribute('data-src');
    });
}

/**
 * Generates HTML for a thumbnail based on the media type.
 *
 * This function takes a media item and its index, extracts the relevant information, and returns
 * the appropriate HTML string based on the type of media (`image`, `video`, `audio`).
 *
 * @param {{src: string, poster?: string, type: 'image' | 'video' | 'audio'}} item - The media item containing `src`, `poster`, and `type`.
 * @param {string|number} index - The index of the item in the list.
 * @returns {HTMLImageElement} The generated <img> element for the media thumbnail.
 */
function getThumbnail(item, index) {
    const {src, poster, type} = item;
    const name = getNameFromUrl(src);

    if (type === 'image') {
        return getImage(src, name, index);
    }
    if (type === 'video') {
        return getImageVideo(src, name, poster, index);
    }
    if (type === 'audio') {
        return getImageAudio(src, name, index);
    }
}

/**
 * @param {'video'|'img'} tagName
 * @param {string} src
 * @param {string} name
 * @param {string|number} index
 * @return {HTMLImageElement | HTMLVideoElement}
 */
function getTag(tagName, src, name, index) {
    return createElement(tagName, {
        data: {
            'src': src,
            'item-index': index.toString(),
        },
        alt: name,
        class: 'thumbnail',
    });
}

/**
 * @param {string} src
 * @param {string} name
 * @param {string|number} index
 * @return {HTMLImageElement}
 */
function getImgTag(src, name, index) {
    return getTag('img', src, name, index);
}

/**
 * @param {string} src
 * @param {string|null} poster
 * @param {string} name
 * @param {string|number} index
 * @return {HTMLVideoElement}
 */
function getVideoTag(src, poster, name, index) {
    const video = getTag('video', src, name, index);
    if (poster) {
        video.setAttribute('poster', poster);
    }
    return video;
}

function getImage(src, name, index) {
    const img = getImgTag(src, name, index);
    img.addEventListener('load', () => {
        const naturalWidth = img.naturalWidth.toString();
        const naturalHeight = img.naturalHeight.toString();
        img.parentElement.setAttribute('data-original-width', naturalWidth);
        img.parentElement.setAttribute('data-original-height', naturalHeight);
        const sizeDiv = img.parentElement.querySelector('.item-details-dimensions');
        sizeDiv.innerHTML = `${naturalWidth}x${naturalHeight}`;
    });
    return img;
}

function getImageVideo(src, name, poster, index) {
    /**
     * @type {HTMLVideoElement}
     */
    const videoElement = getVideoTag(src, poster, name, index);

    videoElement.addEventListener('loadedmetadata', function () {
        const quality = getQualityLabel(videoElement.videoWidth, videoElement.videoHeight);
        videoElement.parentElement.setAttribute('data-video-quality', quality);
        const sizeDiv = videoElement.parentElement.querySelector('.item-details-dimensions');
        sizeDiv.innerHTML = quality;
    });
    return videoElement;
}

function getImageAudio(src, name, index) {
    return getImgTag(src, name, index);
}

function getQualityLabel(width) {
    if (width >= 3840) return '4K';
    if (width >= 2560) return '1440p';
    if (width >= 1920) return '1080p';
    if (width >= 1280) return '720p';
    if (width >= 854) return '480p';
    if (width >= 640) return '360p';
    return 'SD';
}
