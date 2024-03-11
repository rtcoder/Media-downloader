function getImageSelector(index) {
    return `.thumbnail[data-item-index="${index}"]`;
}

function getNameFromUrl(url) {
    return url.split('/').pop();
}
