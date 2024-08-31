/**
 * Executes a content script on the current active tab in all frames.
 *
 * This function retrieves the current active tab and, if the tab is available,
 * executes the specified content script file across all frames in that tab using the Chrome Scripting API.
 *
 * @param {string} scriptUrl - The URL or file path of the content script to execute.
 * @returns {Promise<void>} A promise that resolves once the script has been executed or exits early if no tab is found.
 */
async function executeContentScript(scriptUrl) {
    const tab = await getCurrentTab();
    if (!tab) {
        return;
    }

    chrome.scripting.executeScript({
        target: {tabId: tab.id, allFrames: true},
        files: [scriptUrl],
    });
}

/**
 * Represents information about a browser tab.
 * @typedef {Object} TabInfo
 * @property {boolean} active - Indicates if the tab is active.
 * @property {boolean} audible - Indicates if the tab is currently producing sound.
 * @property {boolean} autoDiscardable - Indicates if the tab can be automatically discarded.
 * @property {boolean} discarded - Indicates if the tab has been discarded.
 * @property {string} favIconUrl - The URL of the tab's favicon.
 * @property {number} groupId - The ID of the group the tab belongs to.
 * @property {number} height - The height of the tab in pixels.
 * @property {boolean} highlighted - Indicates if the tab is highlighted.
 * @property {number} id - The ID of the tab.
 * @property {boolean} incognito - Indicates if the tab is in incognito mode.
 * @property {number} index - The zero-based index of the tab within its window.
 * @property {number} lastAccessed - The time the tab was last accessed, in milliseconds since the UNIX epoch.
 * @property {Object} mutedInfo - Information about the tab's muted state.
 * @property {boolean} mutedInfo.muted - Indicates if the tab is muted.
 * @property {boolean} pinned - Indicates if the tab is pinned.
 * @property {boolean} selected - Indicates if the tab is selected.
 * @property {string} status - The loading status of the tab (e.g., "complete").
 * @property {string} title - The title of the tab.
 * @property {string} url - The URL of the tab.
 * @property {number} width - The width of the tab in pixels.
 * @property {number} windowId - The ID of the window the tab belongs to.
 */

/**
 * Function that returns information about a browser tab or undefined.
 *
 * @returns {TabInfo|null} An object containing tab information, or null if the tab does not exist or the data cannot be retrieved.
 */
async function getCurrentTab() {
    let queryOptions = {active: true, lastFocusedWindow: true};
    let [tab] = await chrome.tabs.query(queryOptions);
    console.log({tab});
    if (tab?.url?.startsWith('chrome://')) {
        return null;
    }

    return tab;
}

/**
 * Initiates the download of a file from the provided URL using the Chrome downloads API.
 *
 * This function triggers a download for the specified URL using `chrome.downloads.download`.
 *
 * @param {string} url - The URL of the file to be downloaded.
 */
function downloadUrl(url) {
    chrome.downloads.download({url});
}

