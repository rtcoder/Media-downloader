chrome.action.onClicked.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "openSidePanel",
        title: "Download media",
        contexts: ["all"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "openSidePanel") {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        chrome.sidePanel.open({ tabId: tab.id });
    }
});
