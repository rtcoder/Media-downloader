const getRowTemplate = ({id, imgSource, title, text}) => {
  return `<tr data-id="${id}">
            <td>
                <label>
                    <input type="checkbox" data-id="${id}" class="image-checkbox" id="${id}">
                </label>
            </td>
            <td>
                <div class="name">
                  <img src="${imgSource}" alt="${title}">
                  <p class="text" title="${imgSource}">${text}</p>
                </div>
            </td>
            <td class="dimensions"></td>
            <td class="size"></td>
            <td>
                <a href="${imgSource}" download="${text}" data-id="${id}" class="download-image-button"></a>
            </td>
        </tr>`;
};

function search_content() {
  const search_for = [];

  if (q('#checkbox-images:checked') !== null) {
    search_for.push('img');
  }
  if (q('#checkbox-videos:checked') !== null) {
    search_for.push('video');
  }
  if (q('#checkbox-music:checked') !== null) {
    search_for.push('audio');
  }

  q('section.images-section .content table tbody').innerHTML = '';

  chrome.tabs.query({
        active: true,
        currentWindow: true
      },
      tabs => {
        chrome.tabs.sendMessage(
            tabs[0].id,
            {search_for: search_for.join(', ')},
            response => {
              let images = [];
              if (!response || typeof response === 'undefined') {
                return;
              }

              for (const img of response.elements.img) {
                const found = images.find(element => element.src === img.src);
                if (typeof found === 'undefined') {
                  images.push(img);
                }
              }

              let errors = 0;
              for (let i in images) {
                if (!images.hasOwnProperty(i) || images[i].src === '') {
                  continue;
                }

                const {title, src: imgSource} = images[i];

                const arr = images[i].src.split('/');
                const text = arr[arr.length - 1];
                const id = hashCode(images[i].src + i);

                images[i].image = new Image();
                images[i].image.src = imgSource;

                images[i].image.onload = (img) => {
                  console.log(img);
                  getImageSizeData(imgSource, data => {
                    const {width, height} = images[i].image;
                    q(`tr[data-id="${id}"] .dimensions`).innerHTML = `${width}px &times ${height}px`;
                    q(`tr[data-id="${id}"] .size`).innerText = bytesToSize(data.size);
                  });
                };

                images[i].image.onerror = () => {
                  q(`tr[data-id="${id}"]`).remove();
                  errors++;

                  q('section.images-section .title span.count').innerText = (images.length - errors);
                };

                const row = getRowTemplate({id, imgSource, text, title});

                q('section.images-section .content table tbody').innerHTML += row;
              }

              q('section.images-section .title span.count').innerText = images.length;
            });
      });
}

document.addEventListener('DOMContentLoaded', () => {
  q('.show-hide').addEventListener('click', ({target}) => {
    const classTarget = target.getAttribute('data-toggle');
    toggleClass(classTarget, 'opened');
  });

  [...qAll('.type-checkbox')].forEach(node =>
      node.addEventListener('change', ({target}) => {
        const typeClass = target.getAttribute('data-type') + '-section';
        if (target.checked) {
          q(`section.${typeClass}`).style.display = 'block';
        } else {
          q(`section.${typeClass}`).style.display = 'none';
        }
      })
  );

  q('#select-images').addEventListener('change', ({target: {checked}}) => {
    qAll('.image-checkbox').forEach(node => node.checked = checked);
  });

  q('.download-selected-images').addEventListener('click', () => {
    const urls = [];

    [...qAll('.image-checkbox:checked')].forEach(node => {
      const dataId = node.getAttribute('data-id');
      const url = q(`.download-image-button[data-id="${dataId}"]`).getAttribute('href');
      urls.push(url);
    });

    downloadAll(urls);
  });

  q('.refresh').addEventListener('click', search_content);

  search_content();
});

