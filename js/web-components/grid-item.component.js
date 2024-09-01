class GridItemComponent extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.data = {};
        GridItemComponent.allAttributes = [
            'src',
            'poster',
            'item-index',
            'type',
            'ext',
            'original-width',
            'original-height',
            'video-quality',
            'class',
        ];
        GridItemComponent.allAttributes.forEach(name => {
            const camelCaseName = this.kebabToCamel(name);
            this.data[camelCaseName] = this.getAttribute(name);
        });
    }

    render() {
        if (!this.data.type) {
            return;
        }
        this.shadowRoot.innerHTML = `
            <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing :border-box;
            }
            :host {
                display: flex;
                width: var(--imageSize);
                height: var(--imageSize);
                position: relative;
            }
            .item {
                justify-self: center;
                position: relative;
                border: 4px solid var(--imageBorderColor);
            
                &:hover {
                    border-color: var(--activeColorHover);
                }
            
                &.checked {
                    border-color: var(--activeColor);
                }
            }
            
            .download_image_button {
                width: 25px;
                position: absolute;
                top: 5px;
                left: 7px;
            }
            
            .item-details {
                position: absolute;
                bottom: 5px;
                left: 0;
                color: #fff;
                padding: 3px;
                width: 100%;
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }
            
            .item-details-ext, .item-details-dimensions {
                background-color: #a1a1a1;
                padding: 3px;
                border-radius: 4px;
            }
            </style>
            
            <div class="item ${this.data.class || ''}">
                <button class="download_image_button" type="button">
                    <x-icon>download</x-icon>
                </button>
                <span class="item-details">
                  <span class="item-details-ext">${this.data.ext}</span>
                  <span class="item-details-dimensions">${this.getDimensions()}</span>
                </span>
                ${this.getThumbnail()}
            </div>
        `;

        this.setListeners();
    }

    setListeners() {
        this.shadowRoot.querySelector('.thumbnail').addEventListener('click', () => {
            this.emitCustomEvent();
        });
    }

    kebabToCamel(kebabCaseString) {
        return kebabCaseString.toLowerCase().replace(/-([a-z])/g, (match, letter) => {
            return letter.toUpperCase();
        });
    }

    getDimensions() {
        const {type, originalWidth, originalHeight, videoQuality} = this.data;

        if (type === 'image' && originalWidth && originalHeight) {
            return originalWidth + 'x' + originalHeight;
        }

        if (type === 'video' && videoQuality) {
            return videoQuality;
        }

        return '';
    }

    getThumbnail() {
        const {src, poster} = this.data;
        if (this.data.type === 'image') {
            return `<grid-item-image-thumbnail class="thumbnail" src="${src}"></grid-item-image-thumbnail>`;
        }
        if (this.data.type === 'video') {
            return `<grid-item-video-thumbnail class="thumbnail" poster="${poster || ''}" src="${src}"></grid-item-video-thumbnail>`;
        }
        if (this.data.type === 'audio') {
            return `<grid-item-audio-thumbnail class="thumbnail" src="${src}"></grid-item-audio-thumbnail>`;
        }
        return '';
    }

    emitCustomEvent() {
        const event = new CustomEvent('item-clicked', {
            detail: {itemIndex: this.data.itemIndex},
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return [
            'src',
            'item-index',
            'type',
            'ext',
            'original-width',
            'original-height',
            'video-quality',
            'class',
        ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }
        const camelcaseName = this.kebabToCamel(name);
        if (camelcaseName in this.data) {
            this.data[camelcaseName] = newValue;
        }
        this.render();
    }
}

customElements.define('grid-item', GridItemComponent);
