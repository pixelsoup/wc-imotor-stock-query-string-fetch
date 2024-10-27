class WcSimpleElement extends HTMLElement {
  static get observedAttributes() {
    return ['data-value'];
  }

  constructor() {
    super();
    // Initialization
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    // Cleanup
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'data-value') {
        this.render();
    }
  }

  render() {
    this.innerHTML = `<p>Value: ${this.getAttribute('data-value')}</p>`;
  }
}

customElements.define('wc-simple-element', WcSimpleElement);