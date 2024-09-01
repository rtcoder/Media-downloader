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

/**
 * Creates a new DOM element with the specified tag name and properties.
 *
 * @param {keyof HTMLElementTagNameMap} tagName - The name of the tag for the element to be created (e.g., 'div', 'span').
 * @param {Object} [props] - An object containing properties to set on the element.
 * @param {string|string[]} [props.class] - A string or an array of strings representing the class(es) to be added to the element.
 * @param {string} [props.html] - The HTML content to be set as the innerHTML of the element.
 * @param {{[key: string]: string}} [props.attributes] - An object representing additional attributes to set on the element (e.g., `{"role": "button"}`).
 * @param {{[key: string]: string|number}} [props.data] - An object representing additional data attributes to set on the element (e.g., `{"data-id": "123"}`).
 * @param {string} [props.type] - The type attribute to be set on the element (useful for elements like `input`).
 * @param {string} [props.title] - The title attribute to be set on the element.
 * @param {string} [props.alt] - The alt attribute to be set on the element.
 * @param {HTMLElement[]|HTMLElement} [children] - Children nodes
 * @returns {HTMLElement} The newly created DOM element.
 */
function createElement(tagName, props = {}, children = []) {
    const element = document.createElement(tagName);

    if (props.class) {
        if (typeof props.class === 'string') {
            element.classList.add(props.class);
        } else {
            element.classList.add(...props.class);
        }
    }

    if (props.html) {
        element.innerHTML = props.html || '';
    }

    if (props.attributes) {
        for (const [attr, value] of Object.entries(props.attributes)) {
            element.setAttribute(attr, value);
        }
    }

    if (props.data) {
        for (const [attr, value] of Object.entries(props.data)) {
            element.setAttribute(`data-${attr}`, value);
        }
    }

    if (props.type) {
        element.type = props.type;
    }

    if (props.title) {
        element.title = props.title;
    }

    if (props.alt) {
        element.alt = props.alt;
    }
    if (children) {
        if (!Array.isArray(children) && children instanceof HTMLElement) {
            children = [children];
        }
        element.append(...children);
    }

    return element;
}

/**
 * Creates a new DOM element with the specified tag name and properties.
 *
 * @param {HTMLElement[]|HTMLElement} [children] - Children nodes
 * @returns {HTMLDivElement} The newly created DOM element.
 */
function createDivElement(props = {}, children = []) {
    return createElement('div', props, children);
}

/**
 * Creates a new DOM element with the specified tag name and properties.
 *
 * @param {HTMLElement[]|HTMLElement} [children] - Children nodes
 * @returns {HTMLSpanElement} The newly created DOM element.
 */
function createSpanElement(props = {}, children = []) {
    return createElement('span', props, children);
}

function createIconElement(iconName, props = {}) {
    props.html = iconName;
    props.classList = props.classList || [];
    props.classList.push('material-symbols-outlined');
    return createSpanElement(props);
}

/**
 * Creates a new DOM element with the specified tag name and properties.
 *
 * @param {HTMLElement[]|HTMLElement} [children] - Children nodes
 * @returns {HTMLButtonElement} The newly created DOM element.
 */
function createButtonElement(props = {}, children = []) {
    props.type = 'button';
    return createElement('button', props, children);
}

/**
 * Creates a new DOM element with the specified tag name and properties.
 *
 * @returns {HTMLImageElement} The newly created DOM element.
 */
function createImgElement(props = {}) {
    return createElement('img', props);
}
