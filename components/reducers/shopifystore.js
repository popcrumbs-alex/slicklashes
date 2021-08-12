import {
  GET_STORE,
  STORE_ERROR,
  SET_TITLE,
  SET_ITEM,
  START_CHECKOUT,
  FETCH_CHECKOUT,
  ADD_CART,
  REMOVE_CART,
  UPDATE_CHECKOUT,
  UPDATE_ADDRESS,
  SHIPPING_ERROR,
  CHECKOUT_COMPLETE,
  SET_SUBTOTAL_FOR_PIXEL,
  CLEAR_SUBTOTAL_AMT,
  UPDATE_BILLING,
  BILLING_ERROR,
  BULK_REMOVE_ITEMS,
  RETRIEVE_SHIPPING_COST,
  SET_SHIPPING_COST,
} from "../actions/types";

const initialState = {
  inventory: [],
  loading: true,
  errors: null,
  storeItem: "",
  businessName: "Slick Love",
  businessSite: "slick.love",
  foundItemName: "",
  foundItem: null,
  checkout: null,
  signedUp: false,
  shippingErrors: null,
  shippingUpdated: false,
  billingUpdated: false,
  billingErrors: null,
  processingRemoval: null,
  addingToCart: true,
  shippingCost: "0.00",
  cartSubtotal: 0.0,
  cart: [],
};

export const shopifystore = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case GET_STORE:
      return {
        ...state,
        inventory: payload.inventory,
        foundItem: payload.mainProduct,
        loading: false,
      };
    case SET_TITLE:
      return {
        ...state,
        foundItemName: payload,
        loading: false,
      };
    case START_CHECKOUT:
      localStorage.setItem("checkout", payload.checkout.id);
      return {
        ...state,
        checkout: payload.checkout,
        loading: false,
      };
    case RETRIEVE_SHIPPING_COST:
      return {
        ...state,
        shippingCost: payload,
        loading: false,
      };
    case UPDATE_CHECKOUT:
      localStorage.setItem("email", payload.email);
      localStorage.setItem("name", payload.name);
      return {
        ...state,
        checkout: payload.checkout,
        loading: false,
        signedUp: true,
        errors: null,
      };
    case FETCH_CHECKOUT:
      return {
        ...state,
        checkout: payload,
        cart: payload.lineItems,
        loading: false,
      };
    case SET_ITEM:
      return {
        ...state,
        foundItem: payload,
        loading: false,
      };
    case ADD_CART:
      return {
        ...state,
        cart: payload.lineItems,
        checkout: payload,
        loading: false,
        addingToCart: false,
        errors: null,
      };
    case REMOVE_CART:
      return {
        ...state,
        cart: payload.lineItems,
        checkout: payload,
        loading: false,
        processingRemoval: false,
      };
    case BULK_REMOVE_ITEMS:
      return {
        ...state,
        cart: payload.lineItems,
        checkout: payload,
        loading: false,
        processingRemoval: false,
      };
    case UPDATE_ADDRESS:
      return {
        ...state,
        checkout: payload,
        loading: false,
        shippingErrors: null,
        shippingUpdated: true,
      };

    case SET_SHIPPING_COST:
      return {
        ...state,
        shippingCost: payload,
      };

    case SHIPPING_ERROR:
      return {
        ...state,
        shippingErrors: payload,
        shippingUpdated: false,
        loading: false,
      };
    case UPDATE_BILLING:
      return {
        ...state,
        checkout: payload,
        billingUpdated: true,
        billingErrors: null,
        loading: false,
      };
    case BILLING_ERROR:
      return {
        ...state,
        billingErrors: payload,
        billingUpdated: false,
        loading: false,
      };
    case STORE_ERROR:
      return {
        ...state,
        errors: payload,
        loading: false,
      };
    case SET_SUBTOTAL_FOR_PIXEL:
      localStorage.setItem("subtotal", payload);
      return {
        ...state,
        cartSubtotal: payload,
        loading: false,
      };
    case CLEAR_SUBTOTAL_AMT:
      localStorage.removeItem("subtotal");
      return {
        ...state,
        loading: false,
        cartSubtotal: null,
      };
    case CHECKOUT_COMPLETE:
      localStorage.removeItem("checkout");
      localStorage.removeItem("email");
      localStorage.removeItem("name");
      return {
        ...state,
        loading: false,
        signedUp: false,
        shippingUpdated: false,
      };

    default:
      return state;
  }
};
