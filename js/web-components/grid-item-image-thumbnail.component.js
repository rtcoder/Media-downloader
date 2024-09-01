class GridItemImageThumbnailComponent extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.data = {
            src: this.getAttribute('src'),
        };

        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
            img {
                width: var(--imageSize);
                height: var(--imageSize);
                object-fit: scale-down;
                background-position: center center;
                background-image: url(/images/transparent.png);
            }
            </style>
            
           <img src="${this.data.src}" alt="">
        `;
    }

    loadImage(img) {
        const naturalWidth = img.naturalWidth.toString();
        const naturalHeight = img.naturalHeight.toString();
        const gridItem = this.getRootNode().host?.closest('grid-item');
        gridItem?.setAttribute('original-width', naturalWidth);
        gridItem?.setAttribute('original-height', naturalHeight);
    }

    connectedCallback() {
        const imgElement = this.shadowRoot.querySelector('img');
        imgElement.addEventListener('load', () => {
            this.loadImage(imgElement);
        });
    }

    disconnectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['src'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name in this.data) {
            this.data[name] = newValue;
        }
        this.render();
    }
}

customElements.define('grid-item-image-thumbnail', GridItemImageThumbnailComponent);
