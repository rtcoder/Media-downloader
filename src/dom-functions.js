function setDisabled(selector, value) {
    document.querySelector(selector).disabled = value;
};

function hasClass(selector, className) {
    return document.querySelector(selector)?.classList.contains(className) || false;
};

function toggleClass(selector, className, toggleValue = null) {
    const elements = document.querySelectorAll(selector);
    if (!elements) {
        return;
    }
    if (toggleValue === null) {
        [...elements].forEach(element => {
            if (element.classList.contains(className)) {
                element.classList.remove(className);
            } else {
                element.classList.add(className);
            }
        });
    } else {
        if (toggleValue) {
            [...elements].forEach(element => element.classList.add(className));
        } else {
            [...elements].forEach(element => element.classList.remove(className));
        }
    }
};

function hide(selector) {
    [...document.querySelectorAll(selector)].forEach(node => node.hidden = true);
}

function show(selector) {
    [...document.querySelectorAll(selector)].forEach(node => node.hidden = false);
}
