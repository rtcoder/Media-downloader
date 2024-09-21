/**
 * Represents a media item to display, including its type.
 * @typedef {Object} DisplayMediaItem
 * @property {string} src - The source URL of the media item.
 * @property {string} type - The type of the media item ('image', 'video', or 'audio').
 * @property {string|null} filetype - The type of the media item ('image', 'video', or 'audio').
 * @property {string|null} alt - The alt of the media item
 * @property {string|null} [poster] - The URL of the video's poster image (only for videos).
 * @property {boolean} selected - is media selected to download
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
    const mapFn = (itemType) => ({type, selected, src, poster}) => ({
        src,
        poster,
        filetype: type,
        selected,
        type: itemType,
    });
    const sectionMapping = {
        images: (media) => media.images.map(mapFn('image')),
        videos: (media) => media.videos.map(mapFn('video')),
        audios: (media) => media.audios.map(mapFn('audio')),
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
    console.log(mediaToDisplay);
    /**
     *
     * @type {Accordion}
     */
    const accordion = document.querySelector('x-accordion');
    const countAll = document.querySelector('.count-all');

    accordion.dataInTabs = mediaToDisplay;

    countAll.innerHTML = countAllMedia(mediaToDisplay).toString();
}

function setTabExpanded(tabId, value) {
    tabExpanded[tabId] = value;
}

function isTabExpanded(tabId, value) {
    return !!tabExpanded[tabId];
}

