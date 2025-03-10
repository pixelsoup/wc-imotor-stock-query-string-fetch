class ImotorStockQs extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({
      mode: 'open'
    });

    // Create a link element to load external CSS
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', './wc-imotor-stock-qs/wc-imotor-stock-qs.css');
    this.shadowRoot.appendChild(link);

    // Create label and select for Make
    const label = document.createElement('label');
    label.setAttribute('for', 'makeSelect');
    label.textContent = 'Make:';

    const select = document.createElement('select');
    select.id = 'makeSelect';

    // Add "All Makes" option as default
    const allMakesOption = document.createElement('option');
    allMakesOption.value = 'all';
    allMakesOption.textContent = 'All';
    select.appendChild(allMakesOption); // Add All Makes first

    // Append label and select to shadow root
    this.shadowRoot.appendChild(label);
    this.shadowRoot.appendChild(select);
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

        // Extract unique makes and their counts
        const makeCounts = {};
        data.forEach(stock => {
          const make = stock.make.toLowerCase();
          makeCounts[make] = (makeCounts[make] || 0) + 1;
        });

        // Populate the select element with unique makes
        this.populateMakeSelect(makeCounts);

        // Get make from query string
        this.updateSelectFromQueryString();

        // Get model from query string
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const modelFilter = urlParams.get('model');

        // Filter data based on make and model
        const makeFilter = this.shadowRoot.getElementById('makeSelect').value;
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

  populateMakeSelect(makeCounts) {
    const selectElement = this.shadowRoot.getElementById('makeSelect');

    // Clear existing options except for "All Makes"
    selectElement.innerHTML = ''; // Start with an empty select

    // Add "All Makes" option as default
    const allMakesOption = document.createElement('option');
    allMakesOption.value = 'all'; // Value for "All Makes"
    allMakesOption.textContent = 'All Makes';
    selectElement.appendChild(allMakesOption); // Add All Makes first

    // Create options for each unique make
    Object.keys(makeCounts).sort().forEach(make => {
      const option = document.createElement('option');
      option.value = make; // Set value to lowercase for case-insensitive matching
      option.textContent = `${make.charAt(0).toUpperCase() + make.slice(1)} (${makeCounts[make]})`; // Capitalize first letter
      selectElement.appendChild(option); // Append unique makes after All Makes
    });

    // Add event listener for selection change
    selectElement.addEventListener('change', (event) => {
      const selectedMake = event.target.value;
      this.filterByMake(selectedMake); // Call method to filter by selected make
    });
  }

  filterByMake(selectedMake) {
    const baseUrl = 'https://s3.ap-southeast-2.amazonaws.com/stock.publish';
    const dealerId = this.getAttribute('dealer-id');

    // Update query string
    const urlParams = new URLSearchParams(window.location.search);
    if (selectedMake === 'all') {
      urlParams.delete('make'); // Remove make from query if "All Makes" is selected
    } else {
      urlParams.set('make', selectedMake); // Set new make in query string
    }
    window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`); // Update URL without reloading

    if (dealerId) {
      const url = `${baseUrl}/dealer_${dealerId}/stock.json`;

      fetch(url)
        .then(response => response.json())
        .then(data => {
          let filteredData;
          if (selectedMake === 'all' || selectedMake === '') {
            filteredData = data; // Return all data if "All Makes" is selected
          } else {
            // Filter data based on selected make
            filteredData = data.filter(stock =>
              stock.make.toLowerCase() === selectedMake.toLowerCase()
            );
          }
          this.render(filteredData); // Render filtered data
        })
        .catch(error => this.render({
          message: error.message
        }));
    }
  }

  updateSelectFromQueryString() {
    const urlParams = new URLSearchParams(window.location.search);
    const makeFilter = urlParams.get('make');

    if (makeFilter) {
      this.shadowRoot.getElementById('makeSelect').value = makeFilter.toLowerCase();
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
    const imageSrc =
      Array.isArray(images) && images.length > 0 ?
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