console.log('test bg');
const media = {
    images: [],
    videos: [],
    audios: [],
};
let mediaToDisplay = [];

// function manageVisibleSections() {
//     let visibleSections = 0;
//     hide('.section-buttons button');
//
//     ['images', 'audios', 'videos']
//         .filter(name => media[name].length)
//         .forEach(name => {
//             show(`.section-buttons button[data-section="${name}"]`);
//             selectSection(name);
//             visibleSections++;
//         });
//
//     if (visibleSections > 1) {
//         show(`.section-buttons button[data-section="all"]`);
//         selectSection('all');
//     }
// }
//
// function displayMedia() {
//     setDisabled('#download-btn', true);
//
//     mediaToDisplay = getAllMediaToDisplay();
//
//     const dataTable = document.querySelector('.grid');
//     const countAll = document.querySelector('.count-all');
//     dataTable.innerHTML = '';
//
//     countAll.innerHTML = `(${mediaToDisplay.length})`;
//
//
//     for (const index in mediaToDisplay) {
//         const {src} = mediaToDisplay[index];
//
//         const item = document.createElement('div');
//         item.classList.add('item');
//         item.innerHTML = `<button type="button" title="Download" class="download_image_button"
//                           data-src="${src}"></button>
//                   ${getThumbnail(mediaToDisplay[index], index)}`;
//         dataTable.append(item);
//     }
// }
chrome.runtime.onMessage.addListener((result) => {
    console.log(result);

    if (result.error && Object.keys(result.error).length > 0) {
        /// error
        console.log(result);
        return;
    }

    ['images', 'audios', 'videos'].filter(name => !!result[name])
        .forEach(name => {

            result[name]
                .filter(item => !media[name].includes(item))
                .forEach(item => media[name].push(item));

        });

    try {
        // manageVisibleSections();
        // displayMedia();
    } catch (er) {
        console.error(er);
    }
});
