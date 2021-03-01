const ls = localStorage;
const media = {
  images: [],
  videos: [],
  audios: []
};
let mediaToDisplay = [];
const columns = 3;

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
  switch (currentSection) {
    case 'all':
      media.images.forEach(src => mediaToDisplay.push({src, type: 'image'}));
      media.videos.forEach(src => mediaToDisplay.push({src, type: 'video'}));
      media.audios.forEach(src => mediaToDisplay.push({src, type: 'audio'}));
      break;
    case 'images':
      media.images.forEach(src => mediaToDisplay.push({src, type: 'image'}));
      break;
    case 'videos':
      media.videos.forEach(src => mediaToDisplay.push({src, type: 'video'}));
      break;
    case 'audio':
      media.audios.forEach(src => mediaToDisplay.push({src, type: 'audio'}));
      break;
  }
  return mediaToDisplay;
}

function getNameFromUrl(url) {
  return url.split('/').pop();
}

function displayMedia() {
  setDisabled('#download-btn', true);

  mediaToDisplay = getAllMediaToDisplay();

  const images_table = document.querySelector('#images_table');
  images_table.innerHTML = '';

  const toggle_all_checkbox_row = `
    <tr>
      <th colspan="${ls.columns}">
        <label>
          <input type="checkbox" id="toggle_all_checkbox">
            Select all (${mediaToDisplay.length})
        </label>
      </th>
    </tr>
  `;
  images_table.innerHTML += toggle_all_checkbox_row;

  const columnWidth = `${Math.round((100 * 100) / columns) / 100}%`;
  const rows = Math.ceil(mediaToDisplay.length / columns);

  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    // Images row
    let images_row = '<tr>';
    for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
      const index = rowIndex * columns + columnIndex;

      let cell;

      if (index >= mediaToDisplay.length) {
        cell = `<td style="width: ${columnWidth};"></td>`;
      } else {
        const {src, type} = mediaToDisplay[index];
        const name = getNameFromUrl(src);
        cell = `<td style="width: ${columnWidth};">
                  <button type="button" title="Download" class="download_image_button"
                          data-img-src="${src}"
                  ></button>`;
        switch (type) {
          case 'image':
            cell += `<img class="thumbnail" data-item-index="${index}" src="${src}"/>`;
            break;
          case 'video':
            cell += `<img class="thumbnail"
                   data-item-index="${index}"
                   src="/images/video.png"/>
                   <p title="${name}">${name}</p>
          `;
            break;
          case 'audio':
            cell += `<img class="thumbnail"
                   data-item-index="${index}"
                   src="/images/audio.png"/>
                   <p title="${name}">${name}</p>
          `;
        }

        cell += `</td>`;
      }
      images_row += cell;
    }
    images_row += '</tr>';
    images_table.innerHTML += images_row;
  }
  [...document.querySelectorAll('.download_image_button')].forEach(btn =>
      btn.addEventListener('click', (e) => {
        downloadItem(e.target.getAttribute('data-img-src'));
      })
  );
  [...document.querySelectorAll('.thumbnail')].forEach(img =>
      img.addEventListener('click', onClickItem)
  );
  document.querySelector('#toggle_all_checkbox').addEventListener('change', changeToggleAllCheckbox);
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
document.querySelectorAll('.section-buttons button').forEach(button =>
    button.addEventListener('click', e => {
      selectSection(e.target.getAttribute('data-section'));
      displayMedia();
    })
);