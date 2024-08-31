/**
 * Generates a CSS selector string for an image thumbnail based on the provided index.
 *
 * This function returns a CSS selector string that targets an image thumbnail
 * with a specific `data-item-index` attribute.
 *
 * @param {number|string} index - The index of the item used in the `data-item-index` attribute.
 * @returns {string} The generated CSS selector string for the image thumbnail.
 */
function getImageSelector(index) {
    return `.thumbnail[data-item-index="${index}"]`;
}

/**
 * Extracts and returns the file name from a given URL.
 *
 * This function splits the URL by slashes and returns the last part,
 * which typically represents the file name or resource name.
 *
 * @param {string} url - The URL string from which to extract the file name.
 * @returns {string} The extracted file name from the URL.
 */
function getNameFromUrl(url) {
    return url.split('/').pop();
}

/**
 * Returns an array of unique items based on the `src` property.
 *
 * This function takes an array of objects, maps them to a Map using the `src` property as the key,
 * and then returns an array of the values from the Map, ensuring that only unique items based on `src` are included.
 *
 * @param {Array<{src: string, [key: string]: any}>} arr - The array of objects to filter for unique `src` values.
 * @returns {Array<{src: string, [key: string]: any}>} A new array containing only unique items based on `src`.
 */
function uniqueSourceItems(arr) {
    return [...new Map(arr.map(item => [item.src, item])).values()];
}

/**
 * Calculates the total number of media items across all tabs.
 *
 * @param {MediaToDisplayItem[]} mediaToDisplay - The array of media items to display.
 * @returns {number} The total count of all media items.
 */
function countAllMedia(mediaToDisplay) {
    return mediaToDisplay.reduce((total, mediaGroup) => {
        return total + mediaGroup.items.length;
    }, 0);
}

function getVideoDimensions(url) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
            resolve({width: video.videoWidth, height: video.videoHeight, duration: video.duration});
        };
        video.onerror = reject;
        video.src = url;
    });
}
