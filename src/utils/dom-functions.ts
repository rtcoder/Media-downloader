import {MixedObject} from '../types/mixed-object.type';

type Children = HTMLElement | HTMLElement[];

export function setDisabled(selector: string, value: boolean) {
  (q(selector) as HTMLButtonElement).disabled = value;
}

export function toggleClass(selector: Element | Element[] | string, className: string, toggleValue: boolean | null = null) {
  let elements = [];
  if (typeof selector === 'string') {
    elements = qAll(selector);
  } else if (Array.isArray(selector)) {
    elements = [...selector];
  } else {
    elements = [selector];
  }
  if (!elements.length) {
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

export function hasClass(selector: Element | string, className: string): boolean {
  let element: Element | null;
  if (typeof selector === 'string') {
    element = q(selector);
  } else {
    element = selector;
  }
  if (!element) {
    return false;
  }
  return element.classList.contains(className);
}

/**
 * @typedef {Object} Props
 * @property {string|string[]} [class] - A string or an array of strings representing the class(es) to be added to the element.
 * @property {string} [html] - The HTML content to be set as the innerHTML of the element.
 * @property {{[key: string]: string|number}} [attributes] - An object representing additional attributes to set on the element.
 * @property {{[key: string]: string|number}} [data] - An object representing additional data attributes to set on the element.
 * @property {string} [type] - The type attribute to be set on the element (useful for elements like `input`).
 * @property {string} [title] - The title attribute to be set on the element.
 * @property {string} [alt] - The alt attribute to be set on the element.
 * @property {string} [src] - The src attribute to be set on the element.
 */

/**
 * Creates a new DOM element with the specified tag name and properties.
 *
 * @param {keyof HTMLElementTagNameMap} tagName - The name of the tag for the element to be created (e.g., 'div', 'span').
 * @param {Props} [props] - An object containing properties to set on the element.
 * @param {Children} [children] - Children nodes to be appended to the created element.
 * @returns {HTMLElement} The newly created DOM element.
 */
export function createElement(tagName: string, props: any = {}, children: Children = []) {
  const element = document.createElement(tagName) as any;

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
      element.setAttribute(attr, value as string);
    }
  }

  if (props.data) {
    for (const [attr, value] of Object.entries(props.data)) {
      element.setAttribute(`data-${attr}`, value as string);
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

  if (props.src) {
    element.src = props.src;
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
 * @param {Props} [props] - An object containing properties to set on the element.
 * @param {Children} [children] - Children nodes to be appended to the created element.
 * @returns {HTMLDivElement} The newly created DOM element.
 */
export function createDivElement(props: any = {}, children: Children = []) {
  return createElement('div', props, children);
}

/**
 * Creates a new DOM element with the specified tag name and properties.
 *
 * @param {Props} [props] - An object containing properties to set on the element.
 * @param {Children} [children] - Children nodes to be appended to the created element.
 * @returns {HTMLSpanElement} The newly created DOM element.
 */
export function createSpanElement(props: any = {}, children: Children = []) {
  return createElement('span', props, children);
}

/**
 * Creates a new DOM element with the specified tag name and properties.
 *
 * @param {Props} [props] - An object containing properties to set on the element.
 * @param {Children} [children] - Children nodes to be appended to the created element.
 * @returns {HTMLButtonElement} The newly created DOM element.
 */
export function createButtonElement(props: MixedObject = {}, children: Children = []) {
  props.type = 'button';
  return createElement('button', props, children);
}

/**
 * Creates a new DOM element with the specified tag name and properties.
 *
 * @param {Props} [props] - An object containing properties to set on the element.
 * @returns {HTMLImageElement} The newly created DOM element.
 */
export function createImgElement(props: any = {}): HTMLImageElement {
  return createElement('img', props) as HTMLImageElement;
}

export function createIconElement(name: string, size = 24): HTMLElement {
  return createSpanElement({
    html: name,
    class: 'x-icon',
    attributes: {
      size,
    },
  });
}

export function show(selector: string | HTMLElement) {
  const el = typeof selector === 'string'
    ? q(selector) as HTMLElement
    : selector;
  if (el) {
    el.hidden = false;
  }
}

export function hide(selector: string | HTMLElement) {
  const el = typeof selector === 'string'
    ? q(selector) as HTMLElement
    : selector;
  if (el) {
    el.hidden = true;
  }
}

export function qAll(selector: string): HTMLElement[] {
  const data: any[] = [];
  const els = document.querySelectorAll(selector) as any;
  els.forEach((el: any) => data.push(el));
  return els as HTMLElement[];
}

export function q(selector: string): HTMLElement {
  return document.querySelector(selector)! as HTMLElement;
}

export function getInputValue(id: string) {
  const elements = document.getElementsByName(id);
  if (!elements.length) {
    return;
  }
  const element = elements.item(0) as HTMLInputElement;
  if (!element) {
    return;
  }
  if (!element) {
    return null;
  }
  if (element.getAttribute('type') === 'radio') {
    const radioElement = q(`input[name="${id}"]:checked`) as HTMLInputElement;
    return radioElement.value;
  }
  if (element.getAttribute('type') === 'checkbox') {
    return element.checked;
  }
  return element.value;
}

export function setInputValue(id: string, value: any) {
  const elements = document.getElementsByName(id);
  if (!elements.length) {
    return;
  }
  const element = elements.item(0) as HTMLInputElement;
  if (!element) {
    return;
  }
  if (element.getAttribute('type') === 'radio') {
    const radioElement = q(`input[name="${id}"][value="${value}"]`) as HTMLInputElement;
    radioElement.checked = true;
    return;
  }
  if (element.getAttribute('type') === 'checkbox') {
    element.checked = value;
    return;
  }
  element.value = value;
}
