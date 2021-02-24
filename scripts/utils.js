const q = selector => {
  return document.querySelector(selector);
};
const qAll = selector => {
  return document.querySelectorAll(selector);
};
const toggleClass = (selector, className) => {
  const nodes = document.querySelectorAll(selector);
  [...nodes].forEach(node => {
    if (node.classList.contains(className)) {
      node.classList.remove(className);
    } else {
      node.classList.add(className);
    }
  });
};

const bytesToSize = bytes => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return 'n/a';
  }
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (i === 0) {
    return `${bytes} ${sizes[i]}`;
  }
  return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
};

const getImageSizeData = (imgURL, callback) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', imgURL, true);
  xhr.responseType = 'blob';
  xhr.onload = function () {
    callback({
      size: xhr.getResponseHeader('Content-Length'),
      status: xhr.status
    });
  };
  xhr.send();
};

const hashCode = str =>
    str.split('')
        .reduce((prevHash, currVal) =>
            ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0);

const downloadAll = urls => {
  const link = document.createElement('a');

  link.setAttribute('download', null);
  link.style.display = 'none';

  document.body.appendChild(link);

  for (const url of urls) {
    link.setAttribute('href', url);
    link.click();
  }

  document.body.removeChild(link);
};