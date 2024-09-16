class AccordionHeader extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.data = {
            name: this.getAttribute('name'),
            favicon: this.getAttribute('favicon'),
            allCount: this.getAttribute('all-count'),
        };
        this._active = false;
    }

    set active(val) {
        if (val === this._active) {
            return;
        }
        this._active = val;
        this.render();
    }

    get active() {
        return this._active;
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing :border-box;
            }
            :host {
                display: flex;
                position: relative;
            }
            .accordion-header {
                width: 100%;
                background-color: var(--accordionHeaderBgColor);
                cursor: pointer;
                padding: 10px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .accordion-header button {
                background: none;
                border: none;
                font-size: 13px;
                text-align: left;
                width: 100%;
                padding: 0;
                cursor: pointer;
                align-items: center;
                display: grid;
                grid-template-columns: 20px calc(100% - 50px) 20px;
                height: auto;
                user-select: none;
            }
            
            .accordion-header button .tab-toggle {
                display: block;
                width: 10px;
                height: 10px;
                position: relative;
            }
            
            .accordion-header button .tab-toggle::after {
                content: '';
                display: inline-block;
                width: 8px;
                height: 8px;
                border-right: 2px solid var(--fontColor);
                border-bottom: 2px solid var(--fontColor);
                transform: rotate(45deg);
                margin-left: 10px;
                transition: transform 0.3s ease;
                position: absolute;
            }
            .accordion-header .favicon {
                width: 16px;
                height: 16px;
                margin-right: 10px;
                pointer-events: none;
                user-select: none;
            }
            .accordion-header.active button .tab-toggle::after {
                transform: rotate(-135deg);
            }
            .accordion-header button .tab-title{
                color: var(--fontColor);
            }
            </style>
            
            <div class="accordion-header ${this.active ? 'active' : ''}">
                <button class="accordion-button">
                    <img src="${this.data.favicon}" alt="Favicon" class="favicon">
                    <span class="tab-title">
                        <span class="title">${this.data.name}</span>
                        <span class="tab-media-count">${this.data.allCount}</span>
                    </span>
                    <span class="tab-toggle"></span>
                </button>
            </div>
        `;

        this.setListeners();
    }

    setListeners() {
        this.shadowRoot.querySelector('.accordion-header').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('accordion-header-clicked', {
                detail: {itemIndex: this.data.itemIndex},
                bubbles: true,
                composed: true,
            }));
        });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return [
            'name',
            'favicon',
            'all-count',
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

customElements.define('x-accordion-header', AccordionHeader);
