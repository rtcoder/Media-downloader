class DualRangeSlider extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        const template = document.createElement('template');
        template.innerHTML = `
      <style>
        .range-slider {
          position: relative;
          width: 100%;
          height: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        input[type="range"] {
          position: absolute;
          width: 100%;
          pointer-events: none;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-thumb {
          pointer-events: auto;
          -webkit-appearance: none;
          width: 15px;
          height: 15px;
          background-color: #4CAF50;
          border-radius: 50%;
          cursor: pointer;
          border: 1px solid transparent;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          background-color: #4CAF50;
          border-color:#09c;
        }
        .slider-track {
          position: absolute;
          height: 5px;
          background: #ddd;
          top: 8px;
          width: 100%;
          z-index: -1;
        }
        .range-values {
          margin-top: 10px;
          text-align: center;
        }
      </style>
      <div class="range-slider">
        <input type="range" id="min-range" min="0" max="100" value="0">
        <input type="range" id="max-range" min="0" max="100" value="100">
        <div class="slider-track"></div>
        <div class="range-values">
          <span id="min-value">0</span> - <span id="max-value">100</span>
        </div>
      </div>
    `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        this.minRange = this.shadowRoot.getElementById('min-range');
        this.maxRange = this.shadowRoot.getElementById('max-range');
        this.minValueDisplay = this.shadowRoot.getElementById('min-value');
        this.maxValueDisplay = this.shadowRoot.getElementById('max-value');
        this.sliderTrack = this.shadowRoot.querySelector('.slider-track');

        const min = this.getAttribute('min') || '0';
        const max = this.getAttribute('max') || '100';
        const start = this.getAttribute('start') || '0';
        const end = this.getAttribute('end') || '100';

        this.minRange.min = min;
        this.maxRange.min = min;
        this.minRange.max = max;
        this.maxRange.max = max;
        this.minRange.value = start;
        this.maxRange.value = end;

        this.updateSlider();

        this.minRange.addEventListener('input', () => this.updateSlider());
        this.maxRange.addEventListener('input', () => this.updateSlider());
        this.sliderTrack.addEventListener('click',e=>{
            const newValue = ((e.clientX - this.sliderTrack.getBoundingClientRect().left) / this.sliderTrack.offsetWidth) * (this.maxRange.max - this.minRange.min) + parseInt(this.minRange.min);
            if (Math.abs(newValue - this.minRange.value) < Math.abs(newValue - this.maxRange.value)) {
                this.minRange.value = newValue;
            } else {
                this.maxRange.value = newValue;
            }
            this.updateSlider();
        })
    }

    updateSlider() {
        const minValueNum = parseInt(this.minRange.value);
        const maxValueNum = parseInt(this.maxRange.value);
        const maxValueGap = 5;

        if (maxValueNum - minValueNum <= maxValueGap) {
            if (this.minRange === document.activeElement) {
                this.minRange.value = maxValueNum - maxValueGap;
            } else {
                this.maxRange.value = minValueNum + maxValueGap;
            }
        }

        this.minValueDisplay.textContent = this.minRange.value;
        this.maxValueDisplay.textContent = this.maxRange.value;

        const percent1 = (this.minRange.value / this.minRange.max) * 100;
        const percent2 = (this.maxRange.value / this.maxRange.max) * 100;

        this.sliderTrack.style.background = `linear-gradient(to right, #ddd ${percent1}% , #4CAF50 ${percent1}% , #4CAF50 ${percent2}%, #ddd ${percent2}%)`;
    }
}

customElements.define('dual-range-slider', DualRangeSlider);
