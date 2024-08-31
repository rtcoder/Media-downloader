// Apply the saved theme or system theme when the extension loads
chrome.storage.sync.get('theme', ({theme}) => {
    applyTheme(theme || 'system');
});

function getBrowserTheme() {
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDarkMode ? 'dark' : 'light';
}

function applyTheme(theme) {
    document.body.classList.remove('light-theme', 'dark-theme');

    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else if (theme === 'system') {
        const systemTheme = getBrowserTheme();
        document.body.classList.add(`${systemTheme}-theme`);
    }
}
