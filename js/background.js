const CHANGES_URL = 'views/changelog.html'; // Link do strony z changelogiem

// Funkcja do sprawdzania wersji i otwierania changeloga
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

chrome.action.onClicked.addListener((tab) => {
    openDownloader(tab);
});

chrome.runtime.onInstalled.addListener(details => {
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
