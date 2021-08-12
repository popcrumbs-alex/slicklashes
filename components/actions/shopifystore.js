import api from "../../utils/api";
import {
  GET_STORE,
  STORE_ERROR,
  SET_TITLE,
  START_CHECKOUT,
  SET_ITEM,
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
} from "./types";
import { setAlert } from "./alert";

export const getStore = () => async (dispatch) => {
  try {
    const res = await api.get("/store/inventory");

    dispatch({
      type: GET_STORE,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: STORE_ERROR,
      payload: error.response.data.msg,
    });

    dispatch(setAlert(error.response.data.msg, "danger"));
  }
};

export const setItemTitle = (title) => async (dispatch) => {
  try {
    dispatch({
      type: SET_TITLE,
      payload: title,
    });
  } catch (error) {
    dispatch({
      type: STORE_ERROR,
      payload: error,
    });
  }
};

export const setItem = (item) => async (dispatch) => {
  try {
    dispatch({
      type: SET_ITEM,
      payload: item,
    });
  } catch (error) {
    dispatch({
      type: STORE_ERROR,
      payload: error,
    });
    dispatch(setAlert("Could not retrieve item", "danger"));
  }
};

export const startCheckout = () => async (dispatch) => {
  try {
    const res = await api.post("/store/startprocess");

    dispatch({
      type: START_CHECKOUT,
      payload: { checkout: res.data },
    });
  } catch (error) {
    const errors = error.response.data.errors;

    if (errors) {
      dispatch({
        type: STORE_ERROR,
        payload: errors.map((err) => err.msg),
      });
      errors.forEach((err) => dispatch(setAlert(err.msg, "danger")));
    }
    dispatch({
      type: STORE_ERROR,
      payload: error.response.data.msg,
    });
    dispatch(setAlert(error.response.data.msg, "danger"));
  }
};

export const updateCheckout = (data) => async (dispatch) => {
  const body = JSON.stringify({ ...data });

  try {
    const res = await api.post("/store/updatecheckout", body);

    console.log("checkout this body", res.data);
    dispatch({
      type: UPDATE_CHECKOUT,
      payload: {
        checkout: res.data,
        email: data.email ? data.email : "test@gmail.com",
        name: data.name ? data.name : "test",
      },
    });
  } catch (error) {
    const errors = error.response.data.errors;

    if (errors) {
      dispatch({
        type: STORE_ERROR,
        payload: errors.map((err) => err.msg),
      });
      errors.forEach((err) => dispatch(setAlert(err.msg, "danger")));
    }
    dispatch({
      type: STORE_ERROR,
      payload: error.response.data.msg,
    });
    dispatch(setAlert(error.response.data.msg, "danger"));
  }
};

export const fetchCheckout = (id) => async (dispatch) => {
  try {
    const res = await api.get(`/store/retrievecheckout/${id}`);

    dispatch({
      type: FETCH_CHECKOUT,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: STORE_ERROR,
      payload: error.response.data.msg,
    });
    dispatch(setAlert(error.response.data.msg, "danger"));
  }
};

export const addToCart = (data) => async (dispatch) => {
  const body = JSON.stringify({ ...data });
  // console.log(body);
  try {
    const res = await api.post("/store/addtocart", body);

    dispatch({
      type: ADD_CART,
      payload: res.data,
    });
    dispatch(setAlert("Item added to cart!", "success"));
  } catch (error) {
    dispatch({
      type: STORE_ERROR,
      payload: error.response.data.msg,
    });

    dispatch(setAlert(error.response.data.msg, "danger"));
  }
};

export const removeFromCart = ({ checkoutId, itemId }) => async (dispatch) => {
  const body = JSON.stringify({ checkoutId, itemId });
  try {
    const res = await api.post("/store/removefromcart", body);

    dispatch({
      type: REMOVE_CART,
      payload: res.data,
    });
    dispatch(setAlert("Item Removed From Cart", "success"));
  } catch (error) {
    dispatch({
      type: STORE_ERROR,
      payload: error.response.data.msg,
    });
    dispatch(setAlert(error.response.data.msg, "danger"));
  }
};

export const bulkRemoveFromCart = ({ checkoutId, itemIds }) => async (
  dispatch
) => {
  const body = JSON.stringify({ checkoutId, itemIds });
  try {
    const res = await api.post("/store/bulkremovefromcart", body);

    dispatch({
      type: BULK_REMOVE_ITEMS,
      payload: res.data,
    });
    dispatch(setAlert("Item Removed From Cart", "success"));
  } catch (error) {
    dispatch({
      type: STORE_ERROR,
      payload: error.response.data.msg,
    });
    dispatch(setAlert(error.response.data.msg, "danger"));
  }
};

export const updateAddress = (data) => async (dispatch) => {
  console.log("any data coming throug?", data);
  try {
    const res = await api.post("/store/addshippinginfo/", data);

    console.log("SHIPPING ADDRESSSSSSS", res.data);
    dispatch({
      type: UPDATE_ADDRESS,
      payload: res.data,
    });

    if (data.isBillingAddress) {
      dispatch(setAlert("Billing Info Saved!", " success", "billing"));
    } else {
      dispatch(setAlert("Shipping Info Saved!", " success", "shipping"));
    }
  } catch (error) {
    console.log(error);
    const errors = error.response.data.errors;
    if (errors) {
      dispatch({
        type: SHIPPING_ERROR,
        payload: errors,
      });
      return errors.forEach((err) =>
        dispatch(setAlert(err.msg, "danger", "shipping"))
      );
    }
    dispatch({
      type: SHIPPING_ERROR,
      payload: error.response.data.msg,
    });
    dispatch(setAlert(error.response.data.msg, "danger", "shipping"));
  }
};

export const updateBillingAddress = (data) => async (dispatch) => {
  try {
    const res = await api.post("/store/addshippinginfo/", data);

    dispatch({
      type: UPDATE_BILLING,
      payload: res.data,
    });

    if (data.isBillingAddress) {
      dispatch(setAlert("Billing Info Saved!", "success", "billing"));
    } else {
      dispatch(setAlert("Shipping Info Saved!", "success", "shipping"));
    }
  } catch (error) {
    console.log(error);
    const errors = error.response.data.errors;
    if (errors) {
      dispatch({
        type: BILLING_ERROR,
        payload: errors,
      });
      return errors.forEach((err) =>
        dispatch(setAlert(err.msg, "danger", "billing"))
      );
    }
    dispatch({
      type: BILLING_ERROR,
      payload: error.response.data.msg,
    });
    dispatch(setAlert(error.response.data.msg, "danger", "billing"));
  }
};

export const clearCheckout = () => async (dispatch) => {
  dispatch({
    type: CHECKOUT_COMPLETE,
  });
};

export const setSubtotalForPixel = (value) => async (dispatch) => {
  try {
    dispatch({
      type: SET_SUBTOTAL_FOR_PIXEL,
      payload: value,
    });
  } catch (error) {
    dispatch({
      type: STORE_ERROR,
      payload: error.response.data.msg,
    });
  }
};

export const clearSubtotal = () => async (dispatch) => {
  dispatch({
    type: CLEAR_SUBTOTAL_AMT,
  });
};

export const retrieveShippingCost = () => async (dispatch) => {
  try {
    const res = await api.get("/store/retrieveshippingcost");

    dispatch({
      type: RETRIEVE_SHIPPING_COST,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: STORE_ERROR,
      payload: error,
    });
  }
};

export const setShippingCost = (val) => async (dispatch) => {
  dispatch({
    type: SET_SHIPPING_COST,
    payload: val,
  });
};
