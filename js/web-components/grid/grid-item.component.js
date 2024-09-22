class GridItemComponent extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.data = {};
        GridItemComponent.allAttributes = [
            'src',
            'filename',
            'poster',
            'item-index',
            'type',
            'ext',
            'original-width',
            'original-height',
            'video-quality',
            'duration',
            'class',
        ];
        GridItemComponent.allAttributes.forEach(name => {
            const camelCaseName = kebabToCamel(name);
            this.data[camelCaseName] = this.getAttribute(name);
        });
        this.addEventListener('thumbnail-clicked', () => {
            this.classList.toggle('checked');
            this.shadowRoot.querySelector('.item').classList.toggle('checked');
        });
        document.addEventListener('select-all', e => {
            dispatchEvent(this, 'thumbnail-clicked', {
                itemIndex: this.data.itemIndex,
                value: e.detail.value,
                type: this.data.type,
            });
        });
    }

    render() {
        if (!this.data.type) {
            return;
        }
        const className = this.data.class;
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
                width: var(--imageSize);
                height: var(--imageSize);
                justify-self: center;
                position: relative;
                border: 4px solid var(--imageBorderColor);
                margin-bottom: 10px;
                display: flex;
                align-items: center;
            
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
                pointer-events: none;
                user-select: none;
            }
            
            .item-details-ext, .item-details-dimensions {
                background-color: #a1a1a1;
                padding: 3px;
                border-radius: 4px;
            }
            .thumbnail {
                width: 100%;
                height: 100%;
            }
            </style>
            
            <div class="item ${className}">
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
            const checked = this.classList.contains('checked');
            dispatchEvent(this, 'thumbnail-clicked', {
                itemIndex: this.data.itemIndex,
                value: !checked,
                type: this.data.type,
            });
        });
        this.shadowRoot.querySelector('.download_image_button').addEventListener('click', () => {
            const filename = this.data.filename;
            downloadItem({
                url: this.data.src,
                filename: filename?.length ? filename : null,
            });
        });
    }

    getDimensions() {
        const {type, originalWidth, originalHeight, videoQuality, duration} = this.data;

        if (type === 'image' && originalWidth && originalHeight) {
            return originalWidth + 'x' + originalHeight;
        }

        if (type === 'video' && videoQuality) {
            return videoQuality;
        }

        if (type === 'audio' && duration) {
            return duration;
        }

        return '';
    }

    getThumbnail() {
        const {src, poster} = this.data;
        if (this.data.type === 'image') {
            return `<image-thumbnail class="thumbnail" src="${src}"></image-thumbnail>`;
        }
        if (this.data.type === 'video') {
            return `<video-thumbnail class="thumbnail" poster="${poster || ''}" src="${src}"></video-thumbnail>`;
        }
        if (this.data.type === 'audio') {
            return `<audio-thumbnail class="thumbnail" src="${src}"></audio-thumbnail>`;
        }
        return '';
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return [
            'src',
            'filename',
            'item-index',
            'type',
            'ext',
            'original-width',
            'original-height',
            'video-quality',
            'duration',
        ];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }
        const camelcaseName = kebabToCamel(name);
        if (camelcaseName in this.data) {
            this.data[camelcaseName] = newValue;
        }
        this.render();
    }
}

customElements.define('grid-item', GridItemComponent);
