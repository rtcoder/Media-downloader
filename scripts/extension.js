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

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {search_for: search_for.join(', ')}, function (response) {
            [].forEach.call(response.elements.img, function (img) {
                let title = img.title ? img.title : "";
                let arr = img.src.split('/');
                let text = arr[arr.length - 1];
                let id = hashCode(img.src);
                let image = '<div class="image-container">\n\
                                <label for="' + id + '">\n\
                                    <input type="checkbox" class="image-checkbox" data-download="' + img.src + '" id="' + id + '">\n\
                                    <div style="background-image: url(' + img.src + ')" title="' + title + '" class="image"></div>\n\
                                    <div class="text">' + text + '</div>\n\
                                </label>\n\
                            </div>';
                $('section.images-section .content').append(image);
            });

            $('section.images-section .title span.count').text('(' + response.elements.img.length + ')');


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
    $('button.view').click(function () {
        if ($(this).attr('id') === 'list-view') {
            $(this).parents('section').find('.content').removeClass('thumbs').addClass('list');
        } else if ($(this).attr('id') === 'thumbnails-view') {
            $(this).parents('section').find('.content').removeClass('list').addClass('thumbs');

        }
    });

    search_content();
    var button = document.getElementById('changelinks');
    button.addEventListener('click', search_content);
});

