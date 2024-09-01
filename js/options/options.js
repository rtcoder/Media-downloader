// Load the saved theme when the options page is opened
document.addEventListener('DOMContentLoaded', () => {
    const themeForm = document.getElementById('theme-form');

    // Load saved theme from storage
    chrome.storage.sync.get('theme', ({theme}) => {
        if (theme) {
            const themeOption = themeForm.querySelector(`input[value="${theme}"]`);
            if (themeOption) {
                themeOption.checked = true;
            }
        }
    });

    // Save the selected theme when form is submitted
    themeForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const selectedTheme = themeForm.elements['theme'].value;
        chrome.storage.sync.set({theme: selectedTheme}, () => {
            alert('Theme saved!');
        });
    });
});
