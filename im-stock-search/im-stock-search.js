class ImStockSearch extends HTMLElement {
  constructor() {
      super();
      this.attachShadow({
          mode: 'open'
      });
      this.stocks = [];
      this.filteredStocks = [];
      this.render();
      this.fetchStockData();
  }

  async fetchStockData() {
      try {
          const response = await fetch('https://s3.ap-southeast-2.amazonaws.com/stock.publish/dealer_2343/stock.json');
          if (!response.ok) throw new Error('Network response was not ok');
          this.stocks = await response.json();
          this.filteredStocks = this.stocks.slice(0, 15); // Initially show top 15
          this.updateResults(); // Update results after fetching data
      } catch (error) {
          console.error('Error fetching stock data:', error);
      }
  }

  connectedCallback() {
    const searchInput = this.shadowRoot.querySelector('input[type="search"]');
    const resultsContainer = this.shadowRoot.querySelector('.results');
    let insideSearchInput = false; // Flag to track if mouse is inside search input

    // Add focus event listener to add 'active' class
    searchInput.addEventListener('focus', (event) => {
      resultsContainer.classList.add('active'); // Add active class
      this.updateResults(); // Show initial results when focused
    });

    // Prevent mousedown and mouseup events on searchInput from affecting elements behind it
    searchInput.addEventListener('mousedown', (event) => {
      event.stopPropagation(); // Prevent mousedown from bubbling up to document
      insideSearchInput = true; // Set flag to true when mousedown occurs
    });

    searchInput.addEventListener('mouseup', (event) => {
      event.stopPropagation(); // Prevent mouseup from bubbling up to document
    });

    // Add input event listener to filter stocks as user types
    searchInput.addEventListener('input', (e) => {
      resultsContainer.classList.add('active'); // Add active class
      this.filterStocks(e.target.value);
    });

    // Click event listener for results container and its children
    resultsContainer.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent click from bubbling up to document
      resultsContainer.classList.add('active'); // Keep active class when clicking inside
    });

    // Click event listener for document to handle clicks outside
    document.addEventListener('click', (event) => {
      if (!searchInput.contains(event.target) && !resultsContainer.contains(event.target)) {
        if (!insideSearchInput) { // Only remove active class if not inside search input
          resultsContainer.classList.remove('active'); // Remove active class if clicked outside
        }
      }
      insideSearchInput = false; // Reset flag after handling click
    });
  }

  filterStocks(query) {
      const lowerCaseQuery = query.toLowerCase();
      this.filteredStocks = this.stocks.filter(stock =>
          stock.make.toLowerCase().includes(lowerCaseQuery) ||
          stock.model.toLowerCase().includes(lowerCaseQuery)
      ).slice(0, 15); // Limit to top 15 results
      this.updateResults();
  }

  updateResults() {
      const resultsContainer = this.shadowRoot.querySelector('.results');
      resultsContainer.innerHTML = ''; // Clear previous results

      if (this.filteredStocks.length > 0) {
          this.filteredStocks.forEach(stock => {
              const stockItem = document.createElement('div');
              stockItem.classList.add('stock-item');

              // Create the link with hardcoded dealer-id and primary-col
              const link = `stock.html?dealer-id=2343&primary-col=crimson&make=${encodeURIComponent(stock.make)}&model=${encodeURIComponent(stock.model)}`;

              // Check if images array exists and has at least one image
              const imageUrl = (stock.images && stock.images.length > 0) ? stock.images[0] : 'https://placehold.co/250x167/e1e1e1/bebebe?text=No%20Image&font=lato'; // Use a placeholder if no image

              stockItem.innerHTML = /*html*/ `
                  <a class="stock-item-link" href="${link}">
                      <img src="${imageUrl}" alt="${stock.make} ${stock.model}" />
                      <div class="stock-item-info">
                          <strong>${stock.make} ${stock.model}</strong><br>
                          Price: ${stock.price} ${stock.priceQualifier}
                      </div>
                  </a>
              `;
              resultsContainer.appendChild(stockItem);
          });
      } else {
          resultsContainer.innerHTML = '<div>No results found</div>';
      }
  }

  render() {
      this.shadowRoot.innerHTML = /*html*/ `
          <style>
              input[type="search"] {
                  width: 340px;
                  padding: 8px;
                  margin-bottom: 10px;
              }
              .results {
                  border: 1px solid #ccc;
                  max-height: 400px;
                  overflow-y: auto;
                  width: 340px;
                  display: none; /* Hide by default */
              }
              .results.active {
                  display: block; /* Show when active */
              }
              .stock-item-link {
                  display: flex;
                  align-items: center;
                  padding: 10px;
                  text-decoration: none;
              }
              .stock-item img {
                  width: 50px;
                  height: auto;
                  margin-right: 10px;
              }
              .stock-item-info {
                  width: 100%;
              }
          </style>
          <input type="search" placeholder="Search by Make or Model" />
          <div class="results"></div>
      `;
  }
}

customElements.define('im-stock-search', ImStockSearch);