class GridItemAudioThumbnailComponent extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this.shadowRoot.innerHTML = `
            <style>
            </style>
            
            <div class="item">
                <button class="download_image_button" type="button">
                    <span class="material-symbols-outlined">download</span>
                </button>
                <span class="item-details">
                  <span class="item-details-ext"></span>
                  <span class="item-details-dimensions"></span>
                </span>
            </div>
        `;
    }

    connectedCallback() {
    }

    disconnectedCallback() {
    }

    static get observedAttributes() {
        return ['some-attribute']; // Wymień atrybuty, które mają być obserwowane
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Atrybut ${name} zmienił się z ${oldValue} na ${newValue}`);
    }
}

customElements.define('grid-item-audio-thumbnail', GridItemAudioThumbnailComponent);
