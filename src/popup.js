const ls = localStorage;
const visibleImages = [];

chrome.runtime.onMessage.addListener((result) => {
  if (result.error) {
    /// error
    console.log(result);
    return;
  }
  result.images.forEach((image) => {
    if (!visibleImages.includes(image)) {
      visibleImages.push(image);
    }
  });
  console.log(result);
  displayImages();
});

function suggestNewFilename(item, suggest) {
  suggest({filename: item.filename});
}

function displayImages() {
  setDisabled('#download-btn', true);

  const images_table = document.querySelector('#images_table');
  images_table.innerHTML = '';

  const toggle_all_checkbox_row = `
    <tr>
      <th colspan="${ls.columns}">
        <label>
          <input type="checkbox" id="toggle_all_checkbox">
            Select all (${visibleImages.length})
        </label>
      </th>
    </tr>
  `;
  images_table.innerHTML += toggle_all_checkbox_row;

  const columns = parseInt(ls.columns, 10);
  const columnWidth = `${Math.round((100 * 100) / columns) / 100}%`;
  const rows = Math.ceil(visibleImages.length / columns);

  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    // Images row
    let images_row = '<tr>';
    for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
      const index = rowIndex * columns + columnIndex;
      if (index === visibleImages.length) {
        break;
      }

      const imageUrl = visibleImages[index];

      images_row += `
        <td style="width: ${columnWidth};">
          <button type="button" title="Download" class="download_image_button"
                  data-img-src="${imageUrl}"
          ></button>
          <img class="img-preview"
               data-image-index="${index}"
               src="${imageUrl}"/>
        </td>
      `;
    }
    images_row += '</tr>';
    images_table.innerHTML += images_row;
  }
  [...document.querySelectorAll('.download_image_button')].forEach(btn =>
      btn.addEventListener('click', (e) => {
        downloadItem(e.target.getAttribute('data-img-src'));
      })
  );
  [...document.querySelectorAll('.img-preview')].forEach(img =>
      img.addEventListener('click', onClickImage)
  );
  document.querySelector('#toggle_all_checkbox').addEventListener('change', changeToggleAllCheckbox);
}

function changeToggleAllCheckbox(e) {
  setDisabled('#download-btn', !e.target.checked);
  for (let index = 0; index < visibleImages.length; index++) {
    toggleClass(getImageSelector(index), 'checked', e.target.checked);
  }
}

function onClickImage(e) {
  $(e.target).toggleClass(
      'checked',
      !$(e.target).hasClass('checked')
  );

  let allAreChecked = true;
  let allAreUnchecked = true;
  for (let index = 0; index < visibleImages.length; index++) {
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
  chrome.downloads.download({url});
}

function downloadImages() {
  const checkedImages = [];
  for (let index = 0; index < visibleImages.length; index++) {
    if (hasClass(getImageSelector(index), 'checked')) {
      checkedImages.push(visibleImages[index]);
    }
  }
  checkedImages.forEach(downloadItem);
}

chrome.downloads.onDeterminingFilename.addListener(suggestNewFilename);

// Get images on the page
chrome.windows.getCurrent((currentWindow) => {
  chrome.tabs.query(
      {active: true, windowId: currentWindow.id},
      (activeTabs) => {
        console.log('caa');
        chrome.tabs.executeScript(activeTabs[0].id, {
          file: '/src/send_media.js',
          allFrames: true,
        });
      }
  );
});

document.getElementById('download-btn').addEventListener('click', downloadImages);