chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    var listElements = document.querySelectorAll(request.search_for);
    var els = {
        a: [],
        img: [],
        video: [],
        audio: []
    };
    [].forEach.call(listElements, function (element) {
        switch (element.tagName.toLowerCase()) {
            case 'img':
                var img = {
                    src: element.src,
                    alt: element.alt,
                    title: element.getAttribute('title')
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

