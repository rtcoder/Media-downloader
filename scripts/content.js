chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var listElements = document.querySelectorAll(request.search_for);
    var els = {
        a: [],
        img: [],
        video: [],
        audio: []
    };
    [].forEach.call(listElements, function (header) {
        switch (header.tagName.toLowerCase()) {
            case 'img':
                var img = {
                    src: header.src,
                    alt: header.alt,
                    title: header.getAttribute('title')
                };

                els.img.push(img);
                break;
            case 'video':
                break;
            case 'audio':
                break;
        }
    });
    sendResponse({data: request.data, elements: els, success: true});
});

