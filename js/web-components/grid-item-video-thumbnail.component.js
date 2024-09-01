class GridItemVideoThumbnailComponent extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.data = {
            src: this.getAttribute('src'),
            poster: this.getAttribute('poster'),
        };

        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
            video {
                width: var(--imageSize);
                height: var(--imageSize);
            }
            </style>
            
           <video src="${this.data.src}" poster="${this.data.poster || ''}"></video>
        `;
    }

    getQualityLabel(width) {
        if (width >= 3840) return '4K';
        if (width >= 2560) return '1440p';
        if (width >= 1920) return '1080p';
        if (width >= 1280) return '720p';
        if (width >= 854) return '480p';
        if (width >= 640) return '360p';
        return 'SD';
    }

    connectedCallback() {
        this.render();
        const videoElement = this.shadowRoot.querySelector('video');
        videoElement.addEventListener('loadedmetadata', () => {
            const quality = this.getQualityLabel(videoElement.videoWidth);
            const gridItem = this.getRootNode().host?.closest('grid-item');
            gridItem?.setAttribute('video-quality', quality);
        });
    }

    static get observedAttributes() {
        return ['src', 'poster'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name in this.data) {
            this.data[name] = newValue;
        }
        this.render();
    }
}

customElements.define('grid-item-video-thumbnail', GridItemVideoThumbnailComponent);
