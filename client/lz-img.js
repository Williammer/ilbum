'use strict'

const template = document.createElement('template');
template.innerHTML = `
<style>
	:host {
		display: block;
		background-color: red;
		position: relative;
		background-size: 100% 100%;
		image-rendering: pixelated;
	}

	img {
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
		animation: fade-in 3s;
	}

	@keyframes fade-in {
		from {opacity: 0}
		to {opacity: 1}
	}
</style>
`;


const io = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.setAttribute('full', '');
    }
  }
})

class LzImg extends HTMLElement {
  static get observedAttributes() {
    return ['full'];
  }

  get src() {
    return this.getAttribute('src');
  }

  get full() {
    return this.hasAttribute('full');
  }

  constructor(props) {
    super(props);
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  attributeChangedCallback() {
    if (this.loaded) {
      return;
    }

    const img = document.createElement('img');
    img.src = this.src;
    img.onload = () => {
      this.loaded = true;
      this.shadowRoot.appendChild(img);
    }
  }

  connectedCallback() {
    io.observe(this);
  }

  disconnectedCallback() {
    io.unobserve(this);
  }
}


customElements.define('lz-img', LzImg);