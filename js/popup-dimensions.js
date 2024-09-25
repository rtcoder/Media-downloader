chrome.storage.sync.get('defaultAction', ({defaultAction}) => {
    switch (defaultAction) {
        case 'popup':
            const html=document.querySelector('html')
            html.style.width='710px';
            html.style.height='530px';
            break;
    }
});
