class ImotorStockQs extends HTMLElement {

  constructor() {
    super(); // Call the parent constructor
    this.attachShadow({ mode: 'open' }); // Create a shadow DOM

    // Create a link element to load external CSS
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './wc-imotor-stock-qs/wc-imotor-stock-qs.css'); // Path to CSS file

    // Append the link to the shadow root
    this.shadowRoot.appendChild(link);
  }

  static get observedAttributes() {
    return ['dealer-id', 'primary-col']; // Observe 'dealer-id' and 'primary-col' attributes
  }

  async connectedCallback() {
    const baseUrl = 'https://s3.ap-southeast-2.amazonaws.com/stock.publish';
    const dealerId = this.getAttribute('dealer-id'); // Get the dealer id from the attribute

    if (dealerId) {
      const url = `${baseUrl}/dealer_${dealerId}/stock.json`; // Construct the full URL

      try {
        const data = await this.fetchData(url); // Fetch data using the constructed URL
        this.render(data); // Render the fetched data
      } catch (error) {
        this.render({ message: error.message }); // Handle errors during fetch
      }
    } else {
      this.render({ message: 'Dealer ID not provided.' }); // Handle missing attribute
    }
  }

  async fetchData(url) {
    const response = await fetch(url); // Fetch data from the given URL
    if (!response.ok) {
      throw new Error('Network response was not ok'); // Handle errors
    }
    return await response.json(); // Return the JSON data
  }

  render(data) {
    // Clear existing items from previous fetches
    let stockItemsWrapper = this.shadowRoot.querySelector('.stockItemsWrapper');

    if (!stockItemsWrapper) {
      stockItemsWrapper = document.createElement('div');
      stockItemsWrapper.classList.add('stockItemsWrapper');
      this.shadowRoot.appendChild(stockItemsWrapper); // Append new wrapper to shadow root
    } else {
      stockItemsWrapper.innerHTML = ''; // Clear previous content of stock items only
    }

    let numberOfStockHeading = this.shadowRoot.querySelector('.number-of-stock');

    if (!numberOfStockHeading) {
      numberOfStockHeading = document.createElement('h3');
      numberOfStockHeading.classList.add('number-of-stock');
      this.shadowRoot.insertBefore(numberOfStockHeading, stockItemsWrapper); // Insert heading before the wrapper
    }

    const numberOfStock = Array.isArray(data) ? data.length : 0;
    numberOfStockHeading.textContent = `${numberOfStock} Stock Items`;

    if (Array.isArray(data)) {
      data.forEach(stock => {
        const stockItemClone = this.createStockItem(stock);
        stockItemsWrapper.appendChild(stockItemClone); // Append each stock item to the wrapper
      });
    } else {
      const messageParagraph = document.createElement('p');
      messageParagraph.textContent = data.message;
      stockItemsWrapper.appendChild(messageParagraph); // Append error message if no data available
    }
  }

  createStockItem(stock) {
    const stockItem = document.createElement('div');
    stockItem.classList.add('stockItem');

    const images = stock.images;
    const imageSrc = (Array.isArray(images) && images.length > 0)
                     ? images[0]
                     : 'https://placehold.co/250x167/e1e1e1/bebebe?text=No%20Image&font=lato';

    const heading = document.createElement('p');
    heading.classList.add('stockItemHeading');
    heading.textContent = `${stock.make} - ${stock.model}`;

    const image = document.createElement('img');
    image.classList.add('stockItemImage');
    image.src = imageSrc;
    image.alt = `${stock.make} ${stock.model}`;

    const featuresDiv = document.createElement('div');
    featuresDiv.classList.add('stockFeatures');

    const features = [
      { label: 'Transmission', value: stock.transmission || 'N/A' },
      { label: 'Body Type', value: stock.bodyType || 'N/A' },
      { label: 'Color', value: stock.colour || 'N/A' },
      { label: 'Kilometres', value: stock.odometer || 'N/A' },
      { label: 'Engine', value: `${stock.size || 'N/A'} ${stock.sizeOption || ''}` },
      { label: 'Stock №', value: stock.stockNumber || 'N/A' }
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
      // Update the CSS custom property when primary-col changes
      this.style.setProperty('--primaryCol', newValue);
    }
  }
}

// Define the custom element
customElements.define('imotor-stock-qs', ImotorStockQs);