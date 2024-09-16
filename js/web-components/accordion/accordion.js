class Accordion extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this._dataInTabs = [];
    }

    set dataInTabs(dataInTabs) {
        if (dataInTabs === this._dataInTabs) {
            return;
        }
        this._dataInTabs = dataInTabs;
        console.log(dataInTabs);
        this.render();
    }

    /**
     *
     * @return {MediaToDisplayItem[]}
     */
    get dataInTabs() {
        return this._dataInTabs;
    }

    render() {
        if (!this._dataInTabs.length) {
            this.shadowRoot.innerHTML = '';
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
                position: relative;
                flex-direction: column;
            }
            </style>
            
            ${mapToString(this.dataInTabs, data => `<x-accordion-item tab-id="${data.tab.id}"></x-accordion-item>`)}
        `;

        this.dataInTabs.forEach(item => {
            /**
             *
             * @type {AccordionItem}
             */
            const accordionItem = this.shadowRoot.querySelector(`x-accordion-item[tab-id="${item.tab.id}"]`);
            accordionItem.dataInTab = item;
        });
    }

    connectedCallback() {
        this.render();
    }
}

customElements.define('x-accordion', Accordion);
