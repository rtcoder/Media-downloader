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
            case 'a':
                var a = {
                    href: header.href,
                    text: header.innerText || header.textContent,
                    title: header.getAttribute('title')
                };

                els.a.push(a);
                break;
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
        console.log(header.tagName.toLowerCase(), els)
    });
    sendResponse({data: request.data, elements: els, success: true});
});

