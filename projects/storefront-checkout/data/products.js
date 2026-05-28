import {formatCurrency} from "../scripts/utils/money.js";

export let products = [];

export function getProduct(productId) {
  return products.find((product) => product.id === productId);
}

class Product {
  id;
  image;
  name;
  rating;
  priceCents;

  constructor(productDetails) {
    this.id = productDetails.id;
    this.image = productDetails.image;
    this.name = productDetails.name;
    this.rating = productDetails.rating;
    this.priceCents = productDetails.priceCents;
  }

  getStartsUrl() {
    return `images/ratings/rating-${this.rating.stars * 10}.png`;
  }

  getPrice() {
    return `$${formatCurrency(this.priceCents)}`;
  }

  extraInfoHTML() {
    return '';
  }
}

class Clothing extends Product {
  sizeChartLink;

  constructor(productDetails) {
    super(productDetails);
    this.sizeChartLink = productDetails.sizeChartLink;
  }

  extraInfoHTML() {
    return `
      <a href="${this.sizeChartLink}" target="_blank" rel="noreferrer">
        Sizing Chart
      </a>
    `;
  }
}

function createProduct(productDetails) {
  if (productDetails.type === "clothing") {
    return new Clothing(productDetails);
  }

  return new Product(productDetails);
}

export function loadProductsFetch() {
  return fetch('backend/products.json')
    .then((response) => response.json())
    .then((productsData) => {
      products = productsData.map(createProduct);
    })
    .catch(() => {
      console.error('An error occurred. Please try again later.');
    });
}

export function loadProducts(callback) {
  const xhr = new XMLHttpRequest();

  xhr.addEventListener('load', () => {
    products = JSON.parse(xhr.response).map(createProduct);
    callback();
  });

  xhr.addEventListener('error', () => {
    console.error('An error occurred. Please try again later.');
  });

  xhr.open('GET', 'backend/products.json');
  xhr.send();
}
