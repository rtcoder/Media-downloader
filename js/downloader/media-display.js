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
    /**
     *
     * @type {MediaToDisplayItem[]}
     */
    const data = mediaInTabs.map(({media, tab}) => {
        const items = getMediaItems(media);
        return {tab, items, showHeader: true};
    });
    if (data.length === 1) {
        data[0].showHeader = false;
    }

    return data;
}

function displayMedia() {
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

