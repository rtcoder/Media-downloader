import {Children, Props} from '../types/dom-functions.type';


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

export function createElement(tagName: string, props: Props = {}, children: Children = []): HTMLElement {
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
  if (props.href) {
    element.href = props.href;
  }
  if (children) {
    if (!Array.isArray(children) && children instanceof HTMLElement) {
      children = [children];
    }
    element.append(...children);
  }

  return element;
}

export function createDivElement(props: Props = {}, children: Children = []) {
  return createElement('div', props, children);
}

export function createSpanElement(props: Props = {}, children: Children = []) {
  return createElement('span', props, children);
}

export function createButtonElement(props: Props = {}, children: Children = []) {
  props.type = 'button';
  return createElement('button', props, children);
}

export function createImgElement(props: Props = {}): HTMLImageElement {
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
