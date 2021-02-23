let urls = [];

function downloadAll(urls) {
  const link = document.createElement('a');

  link.setAttribute('download', null);
  link.style.display = 'none';

  document.body.appendChild(link);

  for (let i = 0; i < urls.length; i++) {
    link.setAttribute('href', urls[i]);
    link.click();
  }

  document.body.removeChild(link);
}

function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) {
    return 'n/a';
  }
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
  if (i === 0) {
    return `${bytes} ${sizes[i]}`;
  }
  return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
}

function getImageSizeData(imgURL, callback) {
  $.ajax({
    method: 'GET',
    url: imgURL
  }).success((data, textStatus, request) => {
    callback({
      size: request.getResponseHeader('Content-Length'),
      status: request.status
    });
  });
}

function hashCode(str) {
  return str.split('').reduce((prevHash, currVal) =>
      ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0);
}

function search_content() {
  var search_for = [];
  if ($('#checkbox-images').is(":checked")) {
    search_for.push('img');
  }
  if ($('#checkbox-videos').is(":checked")) {
    search_for.push('video');
  }
  if ($('#checkbox-music').is(":checked")) {
    search_for.push('audio');
  }
  $('section.images-section .content table tbody').empty();
  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {search_for: search_for.join(', ')}, function (response) {
      let images = [];
      if (!response || typeof response === 'undefined') {
        return;
      }
      for (let j in response.elements.img) {
        let found = images.find(function (element) {
          return element.src === response.elements.img[j].src;
        });
        if (typeof found === 'undefined') {
          images.push(response.elements.img[j]);
        }
      }
      let errors = 0;
      for (let i in images) {
        if (images[i].src === "") {
          continue;
        }
        let title = images[i].title ? images[i].title : "";
        let arr = images[i].src.split('/');
        let text = arr[arr.length - 1];
        if (text.length > 20) {
          text = text.substr(0, 6) + '...' + text.substr(text.length - 6, 6);
        }
        let id = hashCode(images[i].src + i);
        images[i].image = new Image();
        images[i].image.src = images[i].src;
        images[i].image.onload = function () {
          getImageSizeData(images[i].image.src, function (data) {
            $('tr[data-id=' + id + '] .dimensions').html(images[i].image.width + "px &times " + images[i].image.height + "px");
            $('tr[data-id=' + id + '] .size').text(bytesToSize(data.size));
            $('tr[data-id=' + id + '] .loader').remove();
          });
        };
        images[i].image.onerror = function () {
          $('tr[data-id=' + id + ']').remove();
          errors++;
          $('section.images-section .title span.count').text(images.length - errors);
        };

        const imgSource = images[i].src;
        let row = `<tr data-id="${id}">
                    <td>
                        <label>
                            <input type="checkbox" class="image-checkbox" id="${id}">
                        </label>
                    </td>
                    <td>
                        <div class="loader"></div>
                        <div style="background-image: url(${imgSource})" title="${title}" class="image"></div>
                        <div class="text" title="${imgSource}">${text}</div>
                    </td>
                    <td class="dimensions"></td>
                    <td class="size"></td>
                    <td>
                        <a href="${imgSource}" download="${text}" class="download-image-button"></a>
                    </td>
                </tr>`;

        $('section.images-section .content table tbody').append(row);
      }
      $('section.images-section .title span.count').text(images.length);
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  $('.show-hide').click(function () {
    $(this).parents('section').toggleClass('opened');
  });
  $('.type-checkbox').change(function () {
    if ($(this).is(":checked")) {
      $('section.' + $(this).data('type') + '-section').show();
    } else {
      $('section.' + $(this).data('type') + '-section').hide();
    }
  });
  $('#select-images').change(function () {
    $('.image-checkbox').prop('checked', $(this).is(':checked'));
  });

  $('.download-selected-images').click(function () {
    urls = [];
    $('.image-checkbox:checked').each(function () {
      let url = $(this).parents('tr').find('.download-image-button').attr('href');
      urls.push(url);
    });
    downloadAll(urls);
  });
  $('.refresh').click(search_content);
  search_content();
});

