const mediaTypes = ['images', 'audios', 'videos'];

/**
 * Represents a media item within a tab.
 * @typedef {Object} MediaItem
 * @property {string} src - The source URL of the media.
 * @property {string|null} type - The type of the media.
 */

/**
 * Represents a video media item within a tab.
 * @typedef {Object} VideoItem
 * @property {string} src - The source URL of the video.
 * @property {string|null} poster - The URL of the video's poster image, or null if none is provided.
 * @property {string|null} type - The type of the media.
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
 * An array that stores information about media content found in various browser tabs.
 * @type {MediaInTab[]}
 */
const mediaInTabs = [];

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
    mediaTypes.filter(name => !!result[name])
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
    setDisabled('#download-btn', !checked);

    const mediaToDisplay = getAllMediaToDisplay();

    for (let i = 0; i < mediaToDisplay.length; i++) {
        const {tab, items} = mediaToDisplay[i];
        for (let idx = 0; idx < items.length; idx++) {
            toggleClass(getImageSelector(`${tab.id}-${idx}`), 'checked', checked);
        }
    }
}

function onClickItem(e) {
    const index = e.target.getAttribute('data-item-index');
    toggleClass(
        getImageSelector(index),
        'checked',
        !hasClass(getImageSelector(index), 'checked'),
    );

    let allAreChecked = true;
    let allAreUnchecked = true;
    const mediaToDisplay = getAllMediaToDisplay();

    mainLoop: for (let i = 0; i < mediaToDisplay.length; i++) {
        const {tab, items} = mediaToDisplay[i];
        for (let idx = 0; idx < items.length; idx++) {
            if (hasClass(getImageSelector(`${tab.id}-${idx}`), 'checked')) {
                allAreUnchecked = false;
            } else {
                allAreChecked = false;
            }
            // Exit the loop early
            if (!(allAreChecked || allAreUnchecked)) {
                break mainLoop;
            }
        }
    }

    setDisabled('#download-btn', allAreUnchecked);

    const toggle_all_checkbox = document.querySelector('#toggle_all_checkbox');
    toggle_all_checkbox.indeterminate = !(allAreChecked || allAreUnchecked);
    if (allAreChecked) {
        toggle_all_checkbox.checked = true;
    } else if (allAreUnchecked) {
        toggle_all_checkbox.checked = false;
    }
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

function setListeners() {
    document.body.addEventListener('click', e => {
        const {target} = e;
        if (target.matches('#download-btn')) {
            downloadImages(e);
            return;
        }

        if (target.closest('.section-buttons button')) {
            selectSection(target.closest('.section-buttons button').getAttribute('data-section'));
            displayMedia();
            return;
        }

        if (target.matches('.download_image_button')) {
            downloadItem(target.getAttribute('data-src'));
            return;
        }

        if (target.matches('.thumbnail')) {
            onClickItem(e);
            return;
        }

        if (target.matches('.accordion-header') || target.closest('.accordion-button')) {
            const accordionItem = target.closest('.accordion-item');
            accordionItem.classList.toggle('active');
        }
    });

    document.querySelector('#toggle_all_checkbox').addEventListener('change', changeToggleAllCheckbox);
}


function findMedia() {
    executeContentScript('/src/downloader/send_media.js');
}

function init() {
    findMedia();
    setListeners();
}

init();
