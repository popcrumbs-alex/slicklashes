import {
  BRAINTREE_ERROR,
  CREATE_PAYPAL_ORDER,
  GRAB_ORDER_TOTAL,
  PAYPAL_SHIPPING_ERROR,
  PROCESS_BRAINTREE_ORDER,
  RETRIEVE_BRAINTREE_AUTH,
  RETRIEVE_PAYMENT_NONCE,
  UPDATE_ADDRESS_WITH_PAYPAL,
} from "../actions/types";

const initialState = {
  processing: true,
  processingOrderTotal: true,
  orderTotal: null,
  order: null,
  paypalPaymentSucceeded: false,
  paypalAddressUpdated: false,
  paypalCheckout: null,
  clientToken: null,
  paypalErrors: null,
  braintreeOrder: null,
  braintreeErrors: null,
};

export const paypalpayments = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case CREATE_PAYPAL_ORDER:
      return {
        ...state,
        order: payload,
        processing: false,
        paypalPaymentSucceeded: true,
      };
    case GRAB_ORDER_TOTAL:
      return {
        ...state,
        orderTotal: payload,
        processingOrderTotal: false,
      };
    case UPDATE_ADDRESS_WITH_PAYPAL:
      return {
        ...state,
        paypalAddressUpdated: true,
        paypalCheckout: payload,
      };
    case PROCESS_BRAINTREE_ORDER:
      return {
        ...state,
        braintreeOrder: payload,
        braintreeErrors: null,
        paypalPaymentSucceeded: true,
      };
    case RETRIEVE_BRAINTREE_AUTH:
      return {
        ...state,
        clientToken: payload,
      };
    case PAYPAL_SHIPPING_ERROR:
      return {
        ...state,
        paypalAddressUpdated: false,
        paypalErrors: payload,
      };
    case BRAINTREE_ERROR:
      return {
        ...state,
        braintreeErrors: payload,
        braintreeOrder: null,
      };
    default:
      return state;
  }
};
