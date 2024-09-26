const CHANGES_URL = 'views/changelog.html'; // Link do strony z changelogiem

/**
 *
 * @param {InstalledDetails} details
 */
function handleUpdate(details) {
    if (details.reason === 'update') {
        const currentVersion = chrome.runtime.getManifest().version;
        chrome.storage.sync.get('previousVersion', (result) => {
            const previousVersion = result.previousVersion;

            if (previousVersion && previousVersion !== currentVersion) {
                chrome.tabs.create({url: CHANGES_URL});
            }

            chrome.storage.sync.set({previousVersion: currentVersion});
        });
    }
}

/**
 *
 * @param {Tab} tab
 */
function openDownloader(tab) {
    const downloaderPath = '/views/downloader.html';

    chrome.storage.sync.get('defaultAction', ({defaultAction}) => {
        switch (defaultAction) {
            case 'popup':
                chrome.action.setPopup({popup: downloaderPath});
                chrome.action.openPopup();
                break;
            case 'side-panel':
                chrome.sidePanel.setOptions({path: downloaderPath});
                chrome.sidePanel.open({windowId: tab.windowId});
                break;
        }
    });
}

function updateSidePanelBehavior() {
    chrome.storage.sync.get('defaultAction', ({defaultAction}) => {
        chrome.sidePanel.setPanelBehavior({
            openPanelOnActionClick: defaultAction === 'side-panel',
        }).catch((error) => console.log(error));
    });
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    updateSidePanelBehavior();

    chrome.runtime.sendMessage({event: 'tabUpdated', data: {tabId, changeInfo, tab}});
});

chrome.tabs.onActivated.addListener(async (tabId, changeInfo, tab) => {
    updateSidePanelBehavior();

    chrome.runtime.sendMessage({event: 'tabActivated', data: {tabId, changeInfo, tab}});
});

chrome.tabs.onReplaced.addListener(async (tabId, changeInfo, tab) => {
    updateSidePanelBehavior();

    chrome.runtime.sendMessage({event: 'tabReplaced', data: {tabId, changeInfo, tab}});
});

chrome.tabs.onCreated.addListener(async (tabId, changeInfo, tab) => {
    updateSidePanelBehavior();

    chrome.runtime.sendMessage({event: 'tabCreated', data: {tabId, changeInfo, tab}});
});

chrome.action.onClicked.addListener((tab) => {
    openDownloader(tab);
});

chrome.runtime.onInstalled.addListener(details => {
    updateSidePanelBehavior();

    chrome.contextMenus.create({
        id: 'openMediaDownloader',
        title: 'Media Downloader',
        contexts: ['all'],
    });
    handleUpdate(details);
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'openMediaDownloader') {
        openDownloader(tab);
    }
});
