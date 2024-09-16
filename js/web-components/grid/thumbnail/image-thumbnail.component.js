class ImageThumbnailComponent extends HTMLElement {
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
                width: 100%;
                height: 100%;
                object-fit: scale-down;
                pointer-events: none;
                user-select: none;
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

customElements.define('image-thumbnail', ImageThumbnailComponent);
