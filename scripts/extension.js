function search_content() {
    var search_for = [];
    if ($('#checkbox-images').is(":checked")) {
        search_for.push('img');
    }
    if ($('#checkbox-links').is(":checked")) {
        search_for.push('a');
    }
    if ($('#checkbox-videos').is(":checked")) {
        search_for.push('video');
    }
    if ($('#checkbox-music').is(":checked")) {
        search_for.push('audio');
    }

    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {search_for: search_for.join(', ')}, function (response) {
            [].forEach.call(response.elements.a, function (a) {
                let classmane = '';
                if ((!a.text && !a.href) || (a.text.trim() === '' && a.href.trim() === '')) {
                    classmane = 'empty-link';
                }
                let title = a.title ? a.title : "";
                let text = a.text ? a.text : a.href;
                let link = '<a href="' + a.href + '" data-text="' + text + '" title="' + title + '" class="' + classmane + '">' + text + '</a>';
                $('section.links-section .content').append(link);
            });
            [].forEach.call(response.elements.img, function (img) {
                let title = img.title ? img.title : "";
                let image = '<div style="background-image: url(' + img.src + ')" title="' + title + '" class="image"></div>';
                $('section.images-section .content').append(image);
            });

            $('section.links-section .title span.count').text('(' + response.elements.a.length + ')');
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
    search_content();
    var button = document.getElementById('changelinks');
    button.addEventListener('click', search_content);
});

