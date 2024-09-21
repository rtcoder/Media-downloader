class IconComponent extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.render();
    }

    render() {
        const fzAttribute = this.getAttribute('size') || 24;
        const fontSize = this.makeValidFontSize(fzAttribute);
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');
                
                .material-symbols-outlined {
                    font-family: 'Material Symbols Outlined';
                    font-weight: normal;
                    font-style: normal;
                    font-size: 24px;
                    line-height: 1;
                    letter-spacing: normal;
                    text-transform: none;
                    pointer-events: none;
                    user-select: none;
                    justify-content: center;
                    align-items: center;
                    display: flex;
                    white-space: nowrap;
                    word-wrap: normal;
                    direction: ltr;
                    -webkit-font-feature-settings: 'liga';
                    -webkit-font-smoothing: antialiased;
                    font-variation-settings: 'FILL' 0,
                    'wght' 400,
                    'GRAD' 0,
                    'opsz' 48
                }
            </style>
            <span class="material-symbols-outlined" style="font-size: ${fontSize};"><slot></slot></span>
        `;
    }

    /**
     *
     * @param {string|number} value
     * @return {string}
     */
    makeValidFontSize(value) {
        value = value.toString();

        const containsOnlyDigits = str => {
            return /^\d+$/.test(str);
        };

        if (containsOnlyDigits(value)) {
            value = `${value}px`;
        }

        return value;
    }

    static get observedAttributes() {
        return ['size'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.shadowRoot.querySelector('.material-symbols-outlined').style.fontsize = this.makeValidFontSize(newValue);
    }
}

customElements.define('x-icon', IconComponent);
