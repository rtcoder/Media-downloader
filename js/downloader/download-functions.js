/**
 * Initiates the download of a file from the provided URL using the Chrome downloads API.
 *
 * This function logs the URL to the console and then triggers a download using the `chrome.downloads.download` method.
 *
 * @param {Object} itemInfo
 * @param {string} itemInfo.url - The URL of the file to be downloaded.
 * @param {string|null} itemInfo.alt - The URL of the file to be downloaded.
 */
function downloadItem(itemInfo) {
    downloadUrl(itemInfo.url, itemInfo.alt);
}

/**
 * Downloads all checked images from the provided media items.
 *
 * This function iterates over the provided `mediaToDisplay` array, checks each item for the 'checked' class,
 * and if the item is checked, its `src` is added to the list of images to be downloaded. The function then
 * initiates the download for each checked image.
 *
 * @param {MediaToDisplayItem[]} mediaToDisplay -
 *        An array of media items, where each item contains a `tab` object and an `items` array with media details.
 */
function downloadImages(mediaToDisplay) {
    const checkedImages = [];

    for (let i = 0; i < mediaToDisplay.length; i++) {
        const {tab, items} = mediaToDisplay[i];
        for (let idx = 0; idx < items.length; idx++) {
            if (hasClass(getImageSelector(`${tab.id}-${idx}`), 'checked')) {
                checkedImages.push({
                    src: items[idx].src,
                    alt: items[idx].alt,
                });
            }
        }
    }
    checkedImages.forEach(downloadItem);
}
