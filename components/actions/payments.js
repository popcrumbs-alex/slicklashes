import api from "../../utils/api";
import { setAlert } from "./alert";
import {
  CLEAR_PAYMENT_OBJECT,
  CREATE_INTENT,
  PAYMENT_ERROR,
  SET_PAYMENT_TO_SUCCEED,
  UPDATE_PAYMENT_INTENT,
} from "./types";

export const createIntent = ({
  items,
  checkoutId,
  shippingPrice,
  tax,
  email,
  name,
  shippingAddress,
}) => async (dispatch) => {
  const data = {
    items,
    checkoutId,
    shippingPrice,
    shippingAddress,
    tax,
    email,
    name,
  };
  try {
    const res = await api.post("/payments/create-payment-intent", data);

    console.log("PAYMENT INTENT CREATED:", res.data);
    dispatch({
      type: CREATE_INTENT,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: PAYMENT_ERROR,
      payload: error.response.data.msg,
    });
    dispatch(setAlert(error.response.data.msg, "danger"));
  }
};

export const updatePaymentIntent = ({
  items,
  shippingPrice,
  paymentIntentId,
  tax,
  email,
  shippingAddress,
  name,
}) => async (dispatch) => {
  const body = {
    items,
    shippingPrice,
    paymentIntentId,
    tax,
    email,
    shippingAddress,
    name,
  };
  try {
    const res = await api.post("/payments/update-payment-intent", body);

    dispatch({
      type: UPDATE_PAYMENT_INTENT,
      payload: res.data,
    });
  } catch (error) {
    console.error(error);
    dispatch({
      type: PAYMENT_ERROR,
      payload: error,
    });
  }
};

export const setPaymentSucceeded = (value) => async (dispatch) => {
  dispatch({
    type: SET_PAYMENT_TO_SUCCEED,
    payload: value,
  });
};

export const clearPaymentObject = () => async (dispatch) => {
  dispatch({
    type: CLEAR_PAYMENT_OBJECT,
  });
};
