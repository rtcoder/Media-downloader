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
                        createElement('grid-item', {
                            attributes: {
                                'item-index': `${mediaGroup.tab.id}-${itemIndex}`,
                                src: mediaItem.src,
                                poster: mediaItem.poster || '',
                                ext: mediaItem.filetype,
                                type: mediaItem.type,
                            },
                        }),
                    ),
                ),
            ),
        ]),
    ));
    dataTable.querySelectorAll('.thumbnail[data-src]').forEach(el => {
        console.log(el);
        el.src = el.getAttribute('data-src');
    });
}

