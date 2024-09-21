class AudioThumbnailComponent extends HTMLElement {
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
            x-icon {
                width: 100%;
                height: 100%;
                object-fit: scale-down;
                pointer-events: none;
                user-select: none;
                position: absolute;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            audio {
                visibility: hidden;
                opacity: 0;
                position:absolute;
                user-select:none;
                pointer-events: none;
                width: 1px;
                height: 1px;
            }
            </style>
            
           <audio src="${this.data.src}"></audio>
           <x-icon size="50">music_note</x-icon>
        `;
    }
    formatTime(seconds) {
        const sec = Math.floor(seconds % 60); // Sekundy
        const min = Math.floor((seconds % 3600) / 60); // Minuty
        const hrs = Math.floor(seconds / 3600); // Godziny

        const secStr = sec < 10 ? `0${sec}` : sec; // Dodaj zero przed sekundami, jeśli mniej niż 10
        const minStr = min < 10 ? `0${min}` : min; // Dodaj zero przed minutami, jeśli mniej niż 10

        if (hrs > 0) {
            return `${hrs}:${minStr}:${secStr}`; // Format hh:mm:ss
        } else {
            return `${minStr}:${secStr}`; // Format mm:ss
        }
    }
    connectedCallback() {
        const audioElement = this.shadowRoot.querySelector('audio');
        audioElement.addEventListener('loadedmetadata', () => {
            const duration = this.formatTime(audioElement.duration);
            const gridItem = this.getRootNode().host?.closest('grid-item');
            gridItem?.setAttribute('duration', duration);
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

customElements.define('audio-thumbnail', AudioThumbnailComponent);
