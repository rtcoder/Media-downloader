class AccordionItem extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.tabId = null;
        this._dataInTab = null;
        this.expanded = false;

        this.addEventListener('accordion-header-clicked', (event) => {
            /**
             *
             * @type {AccordionHeader}
             */
            const header = event.target;
            if (header) {
                const body = this.shadowRoot.querySelector('x-accordion-body');
                this.expanded = !this.expanded;
                body.hidden = !this.expanded;
                header.active = this.expanded;
            }
        });
    }

    set dataInTab(dataInTab) {
        if (dataInTab === this._dataInTab) {
            return;
        }
        this._dataInTab = dataInTab;
        this.render();
    }

    /**
     *
     * @return {MediaToDisplayItem}
     */
    get dataInTab() {
        return this._dataInTab;
    }

    render() {
        if (!this.tabId || !this.dataInTab) {
            return;
        }

        const {tab, items} = this.dataInTab;

        this.shadowRoot.innerHTML = `
            <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing :border-box;
            }
            :host {
                width: 100%;
                display: flex;
                flex-direction: column;
                position: relative;
                border: 1px solid var(--accordionItemBorderColor);
                border-left: none;
                border-right: none;
                margin-bottom: 10px;
                overflow: hidden;
            }
            x-accordion-body[hidden] {
                display: none !important;
            }

            </style>
            
            <x-accordion-header name="${tab.title}" favicon="${tab.favIconUrl}" all-count="${items.length}"></x-accordion-header>
            <x-accordion-body></x-accordion-body>
        `;
        const bodyAccordion = this.shadowRoot.querySelector('x-accordion-body');
        bodyAccordion.items = this.dataInTab.items;
        bodyAccordion.hidden = !this.expanded;
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['tab-id'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue === newValue) {
            return;
        }
        this.tabId = newValue;
        this.render();
    }
}

customElements.define('x-accordion-item', AccordionItem);
