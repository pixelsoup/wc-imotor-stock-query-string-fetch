// Function to get query parameters from URL
function getQueryParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const regex = /([^&=]+)=([^&]*)/g;
  let match;
  while (match = regex.exec(queryString)) {
      params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
  }
  return params;
}

// Update imotor-stock-qs attributes based on query parameters
function updateStockFetcherFromQuery() {
  const params = getQueryParams();
  const stockFetcher = document.querySelector('imotor-stock-qs');

  if (params['dealer-id']) {
      stockFetcher.setAttribute('dealer-id', params['dealer-id']);
  }
  if (params['primary-col']) {
      stockFetcher.setAttribute('primary-col', params['primary-col']);
  }
}

// Call this function to update attributes based on URL query parameters when the page loads
window.onload = updateStockFetcherFromQuery;