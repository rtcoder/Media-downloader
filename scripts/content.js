chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const listElements = document.querySelectorAll(request.search_for);
  const elements = {
    img: [],
    video: [],
    audio: []
  };
  [...listElements].forEach(element => {
    switch (element.tagName.toLowerCase()) {
      case 'img':
        let img = {
          src: element.src,
          alt: element.alt,
          title: element.getAttribute('title')
        };
        elements.img.push(img);
        break;
      case 'video':
        break;
      case 'audio':
        break;
    }
  });
  sendResponse({
    data: request.data,
    search: request.search_for,
    elements,
    success: true
  });
});

