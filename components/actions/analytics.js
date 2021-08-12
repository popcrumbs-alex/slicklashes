import api, { socketEndpoint } from "../../utils/api";
import {
  GET_PAGE_VIEWS,
  GET_PURCHASES_AMOUNT,
  GET_TRACKING_INFO,
  GET_USER_EMAILS,
  RETRIEVE_CUSTOMER_INFO,
  START_TRACKING,
  TRACKING_ERROR,
} from "./types";

export const createTracking = (data) => async (dispatch) => {
  console.log("this make it?", data);
  const body = JSON.stringify({ ...data });

  try {
    const res = await api.post(`/analytics/track`, body);
    console.log("THIS IS USER DATA<>", res.data);
    dispatch({
      type: START_TRACKING,
      payload: res.data,
    });
  } catch (error) {
    console.error(error);
    dispatch({
      type: TRACKING_ERROR,
      payload: error,
    });
  }
};

export const getTrackingInfo = () => async (dispatch) => {
  const res = await api.get("/analytics/tracking");
  try {
    dispatch({
      type: GET_TRACKING_INFO,
      payload: res.data,
    });
  } catch (error) {
    console.error(error);
    dispatch({
      type: TRACKING_ERROR,
      payload: error,
    });
  }
};

export const getUserEmails = () => async (dispatch) => {
  const res = await api.get("/customers/emails");

  try {
    dispatch({
      type: GET_USER_EMAILS,
      payload: res.data,
    });
  } catch (error) {
    console.error(error);
    dispatch({
      type: TRACKING_ERROR,
      payload: error,
    });
  }
};

export const getPageViews = () => async (dispatch) => {
  try {
    const res = await api.get("/analytics/pageviews");
    dispatch({
      type: GET_PAGE_VIEWS,
      payload: res.data,
    });
  } catch (error) {
    console.error(error);
    dispatch({
      type: TRACKING_ERROR,
      payload: error,
    });
  }
};

export const getPurchaseAmount = () => async (dispatch) => {
  try {
    const res = await api.get("/customers/purchases");
    dispatch({
      type: GET_PURCHASES_AMOUNT,
      payload: res.data,
    });
  } catch (error) {
    console.error(error);
    dispatch({
      type: TRACKING_ERROR,
      payload: error,
    });
  }
};

export const retrieveCustomerInfo = () => async (dispatch) => {
  try {
    const res = await api.get("/customers/allcustomers");
    dispatch({
      type: RETRIEVE_CUSTOMER_INFO,
      payload: res.data,
    });
  } catch (error) {
    console.error(error);
    dispatch({
      type: TRACKING_ERROR,
      payload: error,
    });
  }
};
