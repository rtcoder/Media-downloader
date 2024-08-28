/**
 * Sets the disabled property of an HTML element selected by the provided selector.
 *
 * This function uses `document.querySelector` to select the element and sets its `disabled` attribute
 * to the provided value.
 *
 * @param {string} selector - The CSS selector string to select the element.
 * @param {boolean} value - The value to set for the `disabled` attribute.
 */
function setDisabled(selector, value) {
    document.querySelector(selector).disabled = value;
}

/**
 * Checks if the element selected by the provided selector has the specified class.
 *
 * This function returns `true` if the element has the specified class, and `false` otherwise.
 *
 * @param {string} selector - The CSS selector string to select the element.
 * @param {string} className - The class name to check for.
 * @returns {boolean} `true` if the element has the class, otherwise `false`.
 */
function hasClass(selector, className) {
    return document.querySelector(selector)?.classList.contains(className) || false;
}

/**
 * Toggles a class for elements selected by the provided selector.
 *
 * This function either toggles the class on or off based on its current state, or explicitly adds/removes
 * the class based on the value of `toggleValue`.
 *
 * @param {string} selector - The CSS selector string to select the elements.
 * @param {string} className - The class name to toggle.
 * @param {boolean|null} [toggleValue=null] - If `true`, the class is added; if `false`, the class is removed;
 *                                            if `null`, the class is toggled based on its current state.
 */
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
}

/**
 * Hides elements selected by the provided selector.
 *
 * This function sets the `hidden` attribute to `true` for all elements matching the provided selector.
 *
 * @param {string} selector - The CSS selector string to select the elements.
 */
function hide(selector) {
    [...document.querySelectorAll(selector)].forEach(node => node.hidden = true);
}

/**
 * Shows elements selected by the provided selector.
 *
 * This function sets the `hidden` attribute to `false` for all elements matching the provided selector.
 *
 * @param {string} selector - The CSS selector string to select the elements.
 */
function show(selector) {
    [...document.querySelectorAll(selector)].forEach(node => node.hidden = false);
}
