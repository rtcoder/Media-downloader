const defaultSettings = {
    theme: 'system',
    defaultAction: 'popup',
};

function getValue(id) {
    const elements = document.getElementsByName(id);
    if (!elements.length) {
        return;
    }
    const element = elements.item(0);
    if (!element) {
        return;
    }
    if (!element) {
        return null;
    }
    if (element.getAttribute('type') === 'radio') {
        const radioElement = document.querySelector(`input[name="${id}"]:checked`);
        return radioElement.value;
    }
    if (element.getAttribute('type') === 'checkbox') {
        return element.checked;
    }
    return element.value;
}

function setValue(id, value) {
    const elements = document.getElementsByName(id);
    if (!elements.length) {
        return;
    }
    const element = elements.item(0);
    if (!element) {
        return;
    }
    if (element.getAttribute('type') === 'radio') {
        const radioElement = document.querySelector(`input[name="${id}"][value="${value}"]`);
        radioElement.checked = true;
        return;
    }
    if (element.getAttribute('type') === 'checkbox') {
        element.checked = value;
        return;
    }
    element.value = value;
}

function composeDataToSave() {
    const dataToSave = {};
    Object.keys(defaultSettings).forEach(key => {
        dataToSave[key] = getValue(key);
    });

    return dataToSave;
}

function fillFormWithData(data) {
    Object.keys(data).forEach(key => {
        const value = data[key] === null
            ? defaultSettings[key]
            : data[key];
        setValue(key, value);
    });
}

function saveOptions() {
    chrome.storage.sync.set(composeDataToSave(), () => {
        const status = document.getElementById('status');
        status.style.display = 'block';
        setTimeout(() => {
            status.style.removeProperty('display');
        }, 2000);
    });
}

function restoreOptions() {
    chrome.storage.sync.get(defaultSettings, fillFormWithData);
}

document.getElementById('optionsForm').addEventListener('submit', (event) => {
    event.preventDefault();
    saveOptions();
});

document.addEventListener('DOMContentLoaded', restoreOptions);
