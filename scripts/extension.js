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
            alert(JSON.stringify(response.elements));
            $('#status').text(JSON.stringify(response.elements));
            [].forEach.call(response.elements, function (element) {
//                $('#status').text(element.tagName + ', ');

            });



        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('status').textContent = "Extension loaded";
    search_content();
    var button = document.getElementById('changelinks');
    button.addEventListener('click', search_content);
});

