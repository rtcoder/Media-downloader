const CHANGES_URL = 'views/changelog.html'; // Link do strony z changelogiem

// Funkcja do sprawdzania wersji i otwierania changeloga
function handleUpdate(details) {
    if (details.reason === 'update') {
        const currentVersion = chrome.runtime.getManifest().version;
        chrome.storage.sync.get('previousVersion', (result) => {
            const previousVersion = result.previousVersion;

            if (previousVersion && previousVersion !== currentVersion) {
                chrome.tabs.create({ url: CHANGES_URL });
            }

            chrome.storage.sync.set({ previousVersion: currentVersion });
        });
    }
}

chrome.action.onClicked.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onInstalled.addListener(details => {
    chrome.contextMenus.create({
        id: "openSidePanel",
        title: "Media Downloader",
        contexts: ["all"]
    });
    handleUpdate(details);
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "openSidePanel") {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        chrome.sidePanel.open({ tabId: tab.id });
    }
});
