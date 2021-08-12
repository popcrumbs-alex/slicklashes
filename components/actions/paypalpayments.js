import api from "../../utils/api";
import { setAlert } from "./alert";
import {
  BRAINTREE_ERROR,
  CREATE_PAYPAL_ORDER,
  GRAB_ORDER_TOTAL,
  PAYPAL_ERROR,
  PAYPAL_SHIPPING_ERROR,
  PROCESS_BRAINTREE_ORDER,
  RETRIEVE_BRAINTREE_AUTH,
  RETRIEVE_PAYMENT_NONCE,
  UPDATE_ADDRESS_WITH_PAYPAL,
  UPDATE_CHECKOUT,
} from "./types";

export const createPaypalOrder = (data) => async (dispatch) => {
  try {
    const res = await api.post("/paypal/orders/processorder", data);

    dispatch({
      type: CREATE_PAYPAL_ORDER,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: PAYPAL_ERROR,
      payload: error,
    });
  }
};

export const grabOrderTotal = (data) => async (dispatch) => {
  const body = JSON.stringify(data);
  try {
    const res = await api.post("/paypal/ordertotal", body);

    dispatch({
      type: GRAB_ORDER_TOTAL,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: PAYPAL_ERROR,
      payload: error,
    });
  }
};
export const updateAddressWithPaypal = (data) => async (dispatch) => {
  try {
    const res = await api.post("/paypal/addshippinginfo/", data);

    dispatch({
      type: UPDATE_ADDRESS_WITH_PAYPAL,
      payload: res.data,
    });

    dispatch({
      type: UPDATE_CHECKOUT,
      payload: { checkout: res.data, email: "", name: "" },
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: PAYPAL_SHIPPING_ERROR,
      payload: error,
    });
    dispatch(setAlert(error, "danger"));
  }
};

export const retrieveClientToken = () => async (dispatch) => {
  try {
    const res = await api.get("/braintree/authtoken");

    dispatch({
      type: RETRIEVE_BRAINTREE_AUTH,
      payload: res.data,
    });
  } catch (error) {
    console.error(error);
    dispatch({
      type: PAYPAL_ERROR,
      payload: error,
    });
  }
};

export const processBraintreeOrder =
  ({ nonce, checkoutID, email, firstName, lastName, shippingAddress }) =>
  async (dispatch) => {
    const body = JSON.stringify({
      nonce,
      checkoutID,
      email,
      firstName,
      lastName,
      shippingAddress,
    });
    try {
      const res = await api.post("/braintree/charge", body);
      console.log("nonce response do tonca", res.data);
      dispatch({
        type: PROCESS_BRAINTREE_ORDER,
        payload: res.data,
      });
    } catch (error) {
      console.error(error);
      dispatch({
        type: BRAINTREE_ERROR,
        payload: error,
      });
    }
  };
