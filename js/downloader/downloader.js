const mediaTypes = ['images', 'audios', 'videos'];
const restrictedUrls = [
    'https://youtube.com',
    'https://www.youtube.com',
];
/**
 * Represents a media item within a tab.
 * @typedef {Object} MediaItem
 * @property {string} src - The source URL of the media.
 * @property {string|null} type - The type of the media.
 * @property {string|null} alt - The alt of the media item
 * @property {boolean} selected - is media selected to download
 */

/**
 * Represents a video media item within a tab.
 * @typedef {Object} VideoItem
 * @property {string} src - The source URL of the video.
 * @property {string|null} poster - The URL of the video's poster image, or null if none is provided.
 * @property {string|null} type - The type of the media.
 * @property {string|null} alt - The alt of the media item
 * @property {boolean} selected - is media selected to download
 */

/**
 * Represents media information for a tab.
 * @typedef {Object} MediaInfo
 * @property {MediaItem[]} images - An array of image objects found in the tab.
 * @property {MediaItem[]} audios - An array of audio objects found in the tab.
 * @property {VideoItem[]} videos - An array of video objects found in the tab.
 */

/**
 * Represents basic tab information.
 * @typedef {Object} TabData
 * @property {number} id - The ID of the tab.
 * @property {string} favIconUrl - The URL of the tab's favicon.
 * @property {string} url - The URL of the tab.
 * @property {string} title - The title of the tab.
 */

/**
 * Represents the data structure holding information about media in a specific tab.
 * @typedef {Object} MediaInTab
 * @property {TabData} tab - The basic information about the tab.
 * @property {MediaInfo} media - The media information found in the tab.
 */

/**
 * Represents the information about tab whether is expanded or not
 * @typedef {Object} TabExpanded
 * @property {boolean} [key] - The basic information about the tab expanded - key is tabId
 */

/**
 * An array that stores information about media content found in various browser tabs.
 * @type {MediaInTab[]}
 */
const mediaInTabs = [];
/**
 *
 * @type {TabExpanded}
 */
const tabExpanded = {};

function isRestrictedUrl(url) {
    return restrictedUrls.some(restrictedUrl => url.includes(restrictedUrl));
}

chrome.runtime.onMessage.addListener(async (result) => {
    if (result.error && Object.keys(result.error).length > 0) {
        /// error
        console.log(result);
        return;
    }
    const tabInfo = await getCurrentTab();
    if (!tabInfo) {
        return;
    }

    hide('.yt-info');
    if (isRestrictedUrl(tabInfo.url)) {
        show('.yt-info');
        return;
    }
    mediaTypes
        .filter(name => !!result[name])
        .forEach(name => {
            const newMedia = {
                images: [],
                videos: [],
                audios: [],
            };

            result[name]
                .filter(item => !newMedia[name].includes(item))
                .forEach(item => newMedia[name].push(item));

            const {id, favIconUrl, url, title} = tabInfo;
            const existingIndex = mediaInTabs.findIndex(({tab}) => tab.id === id);
            if (existingIndex === -1) {
                mediaInTabs.push({
                    media: newMedia,
                    tab: {id, favIconUrl, url, title},
                });
            } else {
                const {media} = mediaInTabs[existingIndex];
                mediaTypes.forEach(type => {
                    mediaInTabs[existingIndex].media[type] = uniqueSourceItems([
                        ...media[type],
                        ...newMedia[type],
                    ]);
                    mediaInTabs[existingIndex].tab = {id, favIconUrl, url, title};
                });
            }
        });

    displayMedia();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab?.url?.startsWith('chrome://')) {
        return;
    }

    if (tab.active && changeInfo.status === 'complete') {
        findMedia();
    }
});

chrome.tabs.onActivated.addListener(findMedia);

function changeToggleAllCheckbox(e) {
    const {checked} = e.target;
    dispatchEvent(document, 'select-all', {
        value: checked,
    });
}

function onClickItem(e) {
    const {itemIndex, value, type} = e.detail;
    const [tabId, itemIdx] = itemIndex.split('-').map(item => +item);
    const currentSection = mapMediaTypeToSectionName(type);
    const tabIndexInSection = mediaInTabs.findIndex(({tab}) => tab.id === tabId);
    if (tabIndexInSection === -1) {
        return;
    }
    mediaInTabs[tabIndexInSection].media[currentSection][itemIdx].selected = value;

    let allAreChecked = true;
    let allAreUnchecked = true;
    const mediaToDisplay = getAllMediaToDisplay();
    let selectedCount = 0;
    console.log(itemIndex, value);
    for (let i = 0; i < mediaToDisplay.length; i++) {
        const {items} = mediaToDisplay[i];
        for (let idx = 0; idx < items.length; idx++) {
            if (items[idx].selected) {
                allAreUnchecked = false;
                selectedCount++;
            } else {
                allAreChecked = false;
            }
        }
    }

    updateSelectedCountText(selectedCount);

    const toggle_all_checkbox = document.querySelector('#toggle_all_checkbox');
    toggle_all_checkbox.indeterminate = !(allAreChecked || allAreUnchecked);
    if (allAreChecked) {
        toggle_all_checkbox.checked = true;
    } else if (allAreUnchecked) {
        toggle_all_checkbox.checked = false;
    }
}

function updateSelectedCountText(selectedCount) {
    document.querySelector('#download-btn .selected-count').innerHTML = selectedCount > 0
        ? `(${selectedCount})`
        : '';

    setDisabled('#download-btn', !selectedCount);
}

function selectSection(name) {
    name = mediaTypes.includes(name) ? name : 'images';
    toggleClass('.section-buttons button', 'selected', false);
    toggleClass(
        `.section-buttons button[data-section="${name}"]`,
        'selected',
        true,
    );
}

function getCurrentSection() {
    return document.querySelector(`.section-buttons button.selected`)
        .getAttribute('data-section') || 'images';
}


function setListeners() {
    document.body.addEventListener('click', e => {
        const {target} = e;
        if (target.closest('#download-btn')) {
            downloadImages(getAllMediaToDisplay());
            return;
        }

        if (target.closest('.section-buttons button')) {
            selectSection(target.closest('.section-buttons button').getAttribute('data-section'));
            displayMedia();
            return;
        }

        if (target.matches('.thumbnail')) {
            onClickItem(e);
            return;
        }

        if (target.matches('.accordion-header') || target.closest('.accordion-button')) {
            const accordionItem = target.closest('.accordion-item');
            accordionItem.classList.toggle('active');
            return;
        }

        if (target.matches('.yt-info a')) {
            window.open('https://developer.chrome.com/docs/webstore/troubleshooting/#prohibited-products');
        }
    });
    document.addEventListener('thumbnail-clicked', onClickItem);
    document.querySelector('#toggle_all_checkbox').addEventListener('change', changeToggleAllCheckbox);
}

function findMedia() {
    executeContentScript('/js/downloader/send_media.js');
}

function init() {
    findMedia();
    setListeners();
}

init();
