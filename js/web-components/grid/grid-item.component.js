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
            const camelCaseName = kebabToCamel(name);
            this.data[camelCaseName] = this.getAttribute(name);
        });
        this.addEventListener('thumbnail-clicked',()=>{
            this.classList.toggle('checked');
        })
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
            dispatchEvent(this, 'thumbnail-clicked', {itemIndex: this.data.itemIndex});
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
        const camelcaseName = kebabToCamel(name);
        if (camelcaseName in this.data) {
            this.data[camelcaseName] = newValue;
        }
        this.render();
    }
}

customElements.define('grid-item', GridItemComponent);
