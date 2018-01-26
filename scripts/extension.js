function hashCode(str) {
    return str.split('').reduce((prevHash, currVal) =>
        ((prevHash << 5) - prevHash) + currVal.charCodeAt(0), 0);
}
function download(url) {
    alert(url)
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
            let images = [];
            for (let j in response.elements.img) {
                let found = images.find(function (element) {
                    return element.src === response.elements.img[j].src;
                });
                if (typeof found === 'undefined') {
                    images.push(response.elements.img[j]);
                }
            }
            for (let i in images) {
                let title = images[i].title ? images[i].title : "";
                let arr = images[i].src.split('/');
                let text = arr[arr.length - 1];
                let id = hashCode(images[i].src + i);
                images[i].image = new Image();
                images[i].image.src = images[i].src;
                images[i].image.onload = function () {
                    $('.image-container label[for=' + id + '] .dimensions').html("(" + images[i].image.width + "px &times " + images[i].image.height + "px)");
                };

                let image = '<div class="image-container">\n\
                                <label for="' + id + '">\n\
                                    <input type="checkbox" class="image-checkbox" data-download="' + images[i].src + '" id="' + id + '">\n\
                                    <div style="background-image: url(' + images[i].src + ')" title="' + title + '" class="image"></div>\n\
                                    <div class="text">' + text + '</div>\n\
                                    <div class="dimensions"></div>\n\
                                </label>\n\
                                <button class="download-button" title="Download image" data-id="' + id + '" onclick="alert(\"df\")"></button>\n\
                            </div>';
                $('section.images-section .content').append(image);
                $('.image-container .download-button[data-id' + id + ']').click(function () {
                    download($(this).parent().find('label[for=' + id + '] .input').data('download'));
//                    alert()
                });
            }
            $('section.images-section .title span.count').text('(' + images.length + ')');


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
        $('button.view').removeClass('active');
        $(this).addClass('active')
    });

    search_content();
    var button = document.getElementById('changelinks');
    button.addEventListener('click', search_content);
});

