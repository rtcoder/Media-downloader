const setDisabled = (selector, value) => {
  document.querySelector(selector).disabled = value;
};
const hasClass = (selector, className) => {
  return document.querySelector(selector)?.classList.contains(className) || false;
};
const toggleClass = (selector, className, toggleValue = null) => {
  const element = document.querySelector(selector);
  if (!element) {
    return;
  }
  if (toggleValue === null) {
    if (element.classList.contains(className)) {
      element.classList.remove(className);
    } else {
      element.classList.add(className);
    }
  } else {
    if (toggleValue) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }
};
const getImageSelector = index => `.img-preview[data-image-index="${index}"]`;