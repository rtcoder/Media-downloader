class AccordionBody extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this._items = [];
        this.data = {
            tabId: this.getAttribute('tab-id'),
        };
    }

    set items(value) {
        this._items = value;
        this.render();
    }

    /**
     *
     * @return {DisplayMediaItem[]}
     */
    get items() {
        return this._items;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
            * {
                margin: 0;
                box-sizing :border-box;
            }
            :host {
                display: flex;
                position: relative;
                padding: 15px;
                background-color: var(--bgColor);
            }
            .accordion-body {
                width: 100%;
                display: grid;
                grid-template-columns: repeat(auto-fill, var(--imageSize));
                grid-template-rows: auto;
                gap: 15px;
            }
            </style>
            
            <div class="accordion-body">
                ${this.getItemsHtml()}
            </div>
        `;
    }

    getItemsHtml() {
        return this.items.map((mediaItem, itemIndex) => {
            const {src, type, poster, filetype} = mediaItem;
            return `<grid-item
              src="${src}"
              poster="${poster || ''}"
              type="${type}"
              ext="${filetype}"
              item-index="${this.data.tabId}-${itemIndex}"
            ></grid-item>`;
        }).join('');
    }

    static get observedAttributes() {
        return ['tab-id'];
    }

    connectedCallback() {
        this.render();
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

customElements.define('x-accordion-body', AccordionBody);
