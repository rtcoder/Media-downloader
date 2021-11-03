const media = {
  images: [],
  videos: [],
  audios: []
};
let mediaToDisplay = [];

chrome.runtime.onMessage.addListener((result) => {
  if (result.error) {
    /// error
    console.log(result);
    return;
  }
  result.images.forEach((image) => {
    if (!media.images.includes(image)) {
      media.images.push(image);
    }
  });
  result.videos.forEach((video) => {
    if (!media.videos.includes(video)) {
      media.videos.push(video);
    }
  });
  result.audios.forEach((audio) => {
    if (!media.audios.includes(audio)) {
      media.audios.push(audio);
    }
  });
  try {
    manageVisibleSections();
    displayMedia();
  } catch (er) {
    console.error(er);
  }
});

function selectSection(name) {
  name = ['all', 'images', 'videos', 'audio'].includes(name) ? name : 'all';
  toggleClass('.section-buttons button', 'selected', false);
  toggleClass(
      `.section-buttons button[data-section="${name}"]`,
      'selected',
      true
  );
}

function getCurrentSection() {
  return document.querySelector(`.section-buttons button.selected`)
      .getAttribute('data-section') || 'all';
}

function manageVisibleSections() {
  let visibleSections = 0;
  hide('.section-buttons button');
  if (media.audios.length) {
    show(`.section-buttons button[data-section="audio"]`);
    selectSection('audio');
    visibleSections++;
  }
  if (media.images.length) {
    show(`.section-buttons button[data-section="images"]`);
    selectSection('images');
    visibleSections++;
  }
  if (media.videos.length) {
    show(`.section-buttons button[data-section="videos"]`);
    selectSection('videos');
    visibleSections++;
  }
  if (visibleSections > 1) {
    show(`.section-buttons button[data-section="all"]`);
    selectSection('all');
  }
}

function getAllMediaToDisplay() {
  const mediaToDisplay = [];
  const currentSection = getCurrentSection();
  console.log({currentSection});
  console.log({media});
  switch (currentSection) {
    case 'all':
      media.images.forEach(({src}) => mediaToDisplay.push({src, type: 'image'}));
      media.videos.forEach(({src, poster}) => mediaToDisplay.push({src, poster, type: 'video'}));
      media.audios.forEach(({src}) => mediaToDisplay.push({src, type: 'audio'}));
      break;
    case 'images':
      media.images.forEach(({src}) => mediaToDisplay.push({src, type: 'image'}));
      break;
    case 'videos':
      media.videos.forEach(({src, poster}) => mediaToDisplay.push({src, poster, type: 'video'}));
      break;
    case 'audio':
      media.audios.forEach(({src}) => mediaToDisplay.push({src, type: 'audio'}));
      break;
  }
  console.log({mediaToDisplay});
  return mediaToDisplay;
}

function getNameFromUrl(url) {
  return url.split('/').pop();
}

function getThumbnail(item, index) {
  const {src, poster, type} = item;
  const name = getNameFromUrl(src);
  const getImage = (src) => `<img class="thumbnail" data-item-index="${index}" src="${src}" alt=""/>`;

  return {
    image: getImage(src),
    video: `${getImage(poster)} <p title="${name}">${name}</p>`,
    audio: `${getImage('/images/music.png')} <p title="${name}">${name}</p>`,
  }[type] || '';

}

function displayMedia() {
  setDisabled('#download-btn', true);

  mediaToDisplay = getAllMediaToDisplay();

  const dataTable = document.querySelector('.grid');
  const countAll = document.querySelector('.count-all');
  dataTable.innerHTML = '';

  countAll.innerHTML = `(${mediaToDisplay.length})`;


  for (const index in mediaToDisplay) {
    const {src} = mediaToDisplay[index];

    const item = document.createElement('div');
    item.classList.add('item');
    item.innerHTML = `<button type="button" title="Download" class="download_image_button"
                          data-src="${src}"></button>
                  ${getThumbnail(mediaToDisplay[index], index)}`;
    dataTable.append(item);
  }
}

function changeToggleAllCheckbox(e) {
  setDisabled('#download-btn', !e.target.checked);
  for (let index = 0; index < mediaToDisplay.length; index++) {
    toggleClass(getImageSelector(index), 'checked', e.target.checked);
  }
}

function onClickItem(e) {
  const index = e.target.getAttribute('data-item-index');
  toggleClass(
      getImageSelector(index),
      'checked',
      !hasClass(getImageSelector(index), 'checked')
  );

  let allAreChecked = true;
  let allAreUnchecked = true;
  for (let index = 0; index < mediaToDisplay.length; index++) {
    if (hasClass(getImageSelector(index), 'checked')) {
      allAreUnchecked = false;
    } else {
      allAreChecked = false;
    }
    // Exit the loop early
    if (!(allAreChecked || allAreUnchecked)) {
      break;
    }
  }

  setDisabled('#download-btn', allAreUnchecked);

  const toggle_all_checkbox = document.querySelector('#toggle_all_checkbox');
  toggle_all_checkbox.indeterminate = !(allAreChecked || allAreUnchecked);
  if (allAreChecked) {
    toggle_all_checkbox.checked = true;
  } else if (allAreUnchecked) {
    toggle_all_checkbox.checked = false;
  }
}

function downloadItem(url) {
  console.log({url});
  chrome.downloads.download({url});
}

function downloadImages() {
  const checkedImages = [];
  for (let index = 0; index < mediaToDisplay.length; index++) {
    if (hasClass(getImageSelector(index), 'checked')) {
      checkedImages.push(mediaToDisplay[index].src);
    }
  }
  checkedImages.forEach(downloadItem);
}

// Get images on the page
chrome.windows.getCurrent((currentWindow) => {
  chrome.tabs.query(
      {active: true, windowId: currentWindow.id},
      (activeTabs) => {
        chrome.tabs.executeScript(activeTabs[0].id, {
          file: '/src/send_media.js',
          allFrames: true,
        });
      }
  );
});

document.getElementById('download-btn').addEventListener('click', downloadImages);
document.querySelector('.grid').addEventListener('click', e => {
  if (e.target.classList.contains('download_image_button')) {
    downloadItem(e.target.getAttribute('data-src'));
  }
  if (e.target.classList.contains('thumbnail')) {
    onClickItem(e);
  }
});
document.querySelectorAll('.section-buttons button').forEach(button =>
    button.addEventListener('click', e => {
      selectSection(e.target.getAttribute('data-section'));
      displayMedia();
    })
);
document.querySelector('#toggle_all_checkbox').addEventListener('change', changeToggleAllCheckbox);