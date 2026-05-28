import {renderOrderSummary} from "./checkout/orderSummary.js";
import {renderPaymentSummary} from "./checkout/paymentSummary.js";
import {loadProductsFetch} from "../data/products.js";
import {loadCart} from "../data/cart.js";

async function loadPage() {
  try {
    await loadProductsFetch();
    await new Promise((resolve) => {
      loadCart(resolve);
    });
  } catch (error) {
    console.error('An error occurred. Please try again later.');
  }

  renderOrderSummary();
  renderPaymentSummary();
}

loadPage();
