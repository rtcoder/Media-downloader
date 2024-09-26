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
                chrome.action.openPopup();
                break;
            case 'side-panel':
                chrome.sidePanel.open({windowId: tab.windowId});
                break;
        }
    });
}

function updateSidePanelAndPopupBehavior() {
    const downloaderPath = '/views/downloader.html';

    chrome.storage.sync.get('defaultAction', ({defaultAction}) => {
        const isSidePanel = defaultAction === 'side-panel';
        const isPopup = defaultAction === 'popup';

        const downloaderPathForPopup = isPopup
            ? downloaderPath
            : '';
        const downloaderPathForSidePanel = isSidePanel
            ? downloaderPath
            : '';

        chrome.sidePanel.setPanelBehavior({
            openPanelOnActionClick: isSidePanel,
        }).catch((error) => console.log(error));
        chrome.sidePanel.setOptions({path: downloaderPathForSidePanel});


        chrome.action.setPopup({popup: downloaderPathForPopup});
    });
}

chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) => {
    updateSidePanelAndPopupBehavior();

    chrome.runtime.sendMessage({event: 'tabUpdated', data: {tabId, changeInfo, tab}});
});

chrome.tabs.onActivated.addListener( (activeInfo) => {
    updateSidePanelAndPopupBehavior();

    chrome.runtime.sendMessage({event: 'tabActivated', data: {tabId: activeInfo.tabId}});
});

chrome.tabs.onReplaced.addListener( (addedTabId) => {
    updateSidePanelAndPopupBehavior();

    chrome.runtime.sendMessage({event: 'tabReplaced', data: {tabId: addedTabId}});
});

chrome.tabs.onCreated.addListener( (tabId, changeInfo, tab) => {
    updateSidePanelAndPopupBehavior();

    chrome.runtime.sendMessage({event: 'tabCreated', data: {tabId, changeInfo, tab}});
});

chrome.action.onClicked.addListener((tab) => {
    updateSidePanelAndPopupBehavior();
    openDownloader(tab);
});

chrome.runtime.onInstalled.addListener(details => {
    updateSidePanelAndPopupBehavior();

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
