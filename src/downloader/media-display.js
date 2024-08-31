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
    console.log({currentSection});
    console.log({mediaInTabs});
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

    console.log(mediaToDisplay);
    const thumbnails = [];

    mediaToDisplay.forEach((mediaGroup, groupIndex) => {
        const {tab, items} = mediaGroup;

        // Create accordion section
        const accordionItem = document.createElement('div');
        accordionItem.classList.add('accordion-item');
        accordionItem.setAttribute('data-tab-id', `${tab.id}`);

        // Accordion header
        const accordionHeader = document.createElement('div');
        accordionHeader.classList.add('accordion-header');
        accordionHeader.innerHTML = `
            <button class="accordion-button" type="button">
                <img src="${tab.favIconUrl}" alt="Favicon" class="favicon" /> 
                <span class="tab-title">
                  <span class="title">${tab.title}</span>
                  <span class="tab-media-count">(${items.length})</span>
                </span>
                <span class="tab-toggle"></span>
            </button>
        `;

        // Accordion body (media items)
        const accordionBody = createElement('div', {
            classList: 'accordion-collapse',
        });

        const accordionContent = createElement('div', {
            classList: ['accordion-body', 'grid'],
        });

        items.forEach((mediaItem, itemIndex) => {
            const mediaElement = createElement('div', {classList: 'item'});

            const mediaDwdBtn = createElement('button', {
                classList: 'download_image_button',
                type: 'button',
                title: 'Download',
                attributes: {'data-src': mediaItem.src},
            });

            const itemDetails = createElement('div', {classList: 'item-details'});
            const extension = createElement('div', {
                classList: 'item-details-ext',
                innerHtml: (mediaItem.filetype || ''),
            });
            const dimensions = createElement('div', {classList: 'item-details-dimensions'});
            itemDetails.append(extension, dimensions);

            const thumbnail = getThumbnail(mediaItem, `${tab.id}-${itemIndex}`);
            thumbnails.push(thumbnail);
            mediaElement.append(
                mediaDwdBtn,
                itemDetails,
                thumbnail,
            );
            accordionContent.append(mediaElement);
        });

        accordionBody.append(accordionContent);
        accordionItem.append(accordionHeader, accordionBody);
        dataTable.append(accordionItem);
    });
    thumbnails.forEach(img => img.src = img.getAttribute('data-src'));
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
 * @return {HTMLImageElement}
 */
function getImgTag(src, name, index) {
    return createElement('img', {
        attributes: {
            'data-src': src,
            'data-item-index': index.toString(),
        },
        alt: name,
        classList: 'thumbnail',
    });
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
    const img = getImgTag(src, name, index);
    /**
     * @type {HTMLVideoElement}
     */
    const videoElement = createElement('video');

    videoElement.addEventListener('loadedmetadata', function () {
        const quality = getQualityLabel(videoElement.videoWidth, videoElement.videoHeight);
        if (img.parentElement) {
            img.parentElement.setAttribute('data-video-quality', quality);
            const sizeDiv = img.parentElement.querySelector('.item-details-dimensions');
            sizeDiv.innerHTML = quality;
        } else {
            img.setAttribute('data-video-quality', quality);
        }
    });
    img.addEventListener('load', () => {
        const sizeDiv = img.parentElement.querySelector('.item-details-dimensions');
        const quality = img.getAttribute('data-video-quality');
        if (quality) {
            sizeDiv.innerHTML = quality;
        }
    });
    return img;
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
