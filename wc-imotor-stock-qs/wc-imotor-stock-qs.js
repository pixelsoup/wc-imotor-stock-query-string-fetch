class ImotorStockQs extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: 'open'
    });
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './wc-imotor-stock-qs/wc-imotor-stock-qs.css');
    this.shadowRoot.appendChild(link);
  }

  static get observedAttributes() {
    return ['dealer-id', 'primary-col'];
  }

  async connectedCallback() {
    const baseUrl = 'https://s3.ap-southeast-2.amazonaws.com/stock.publish';
    const dealerId = this.getAttribute('dealer-id');

    if (dealerId) {
      const url = `${baseUrl}/dealer_${dealerId}/stock.json`;

      try {
        const data = await this.fetchData(url);

        // Get make and model from query string
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const makeFilter = urlParams.get('make'); // Get 'make' parameter
        const modelFilter = urlParams.get('model'); // Get 'model' parameter

        // Filter data based on make and model
        const filteredData = data.filter(stock => {
          const makeMatches = !makeFilter || stock.make.toLowerCase() === makeFilter.toLowerCase();
          const modelMatches = !modelFilter || stock.model.toLowerCase().includes(modelFilter.toLowerCase());
          return makeMatches && modelMatches; // Both conditions must be true
        });

        this.render(filteredData);
      } catch (error) {
        this.render({
          message: error.message
        });
      }
    } else {
      this.render({
        message: 'Dealer ID not provided.'
      });
    }
  }

  async fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  }

  render(data) {
    let stockItemsWrapper = this.shadowRoot.querySelector('.stockItemsWrapper');

    if (!stockItemsWrapper) {
      stockItemsWrapper = document.createElement('div');
      stockItemsWrapper.classList.add('stockItemsWrapper');
      this.shadowRoot.appendChild(stockItemsWrapper);
    } else {
      stockItemsWrapper.innerHTML = '';
    }

    let numberOfStockHeading = this.shadowRoot.querySelector('.number-of-stock');

    if (!numberOfStockHeading) {
      numberOfStockHeading = document.createElement('h3');
      numberOfStockHeading.classList.add('number-of-stock');
      this.shadowRoot.insertBefore(numberOfStockHeading, stockItemsWrapper);
    }

    const numberOfStock = Array.isArray(data) ? data.length : 0;
    numberOfStockHeading.textContent = `${numberOfStock} Stock Items`;

    if (Array.isArray(data)) {
      data.forEach(stock => {
        const stockItemClone = this.createStockItem(stock);
        stockItemsWrapper.appendChild(stockItemClone);
      });
    } else {
      const messageParagraph = document.createElement('p');
      messageParagraph.textContent = data.message;
      stockItemsWrapper.appendChild(messageParagraph);
    }
  }

  createStockItem(stock) {
    const stockItem = document.createElement('div');
    stockItem.classList.add('stockItem');

    const images = stock.images;
    const imageSrc = (Array.isArray(images) && images.length > 0) ?
      images[0] :
      'https://placehold.co/250x167/e1e1e1/bebebe?text=No%20Image&font=lato';

    const heading = document.createElement('p');
    heading.classList.add('stockItemHeading');
    heading.textContent = `${stock.make} - ${stock.model}`;

    const image = document.createElement('img');
    image.classList.add('stockItemImage');
    image.src = imageSrc;
    image.alt = `${stock.make} ${stock.model}`;

    const featuresDiv = document.createElement('div');
    featuresDiv.classList.add('stockFeatures');

    const features = [{
        label: 'Transmission',
        value: stock.transmission || 'N/A'
      },
      {
        label: 'Body Type',
        value: stock.bodyType || 'N/A'
      },
      {
        label: 'Color',
        value: stock.colour || 'N/A'
      },
      {
        label: 'Kilometres',
        value: stock.odometer || 'N/A'
      },
      {
        label: 'Engine',
        value: `${stock.size || 'N/A'} ${stock.sizeOption || ''}`
      },
      {
        label: 'Stock №',
        value: stock.stockNumber || 'N/A'
      }
    ];

    features.forEach(feature => {
      const featureItem = document.createElement('p');
      featureItem.classList.add('stockFeatureItem');
      const strong = document.createElement('strong');
      strong.textContent = feature.label;
      featureItem.appendChild(strong);
      featureItem.append(` ${feature.value}`);
      featuresDiv.appendChild(featureItem);
    });

    stockItem.appendChild(heading);
    stockItem.appendChild(image);
    stockItem.appendChild(featuresDiv);

    return stockItem;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'dealer-id' && newValue) {
      this.connectedCallback();
    } else if (name === 'primary-col') {
      this.style.setProperty('--primaryCol', newValue);
    }
  }
}

// Define the custom element
customElements.define('imotor-stock-qs', ImotorStockQs);