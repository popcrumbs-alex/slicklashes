import {
  GET_PAGE_VIEWS,
  GET_PURCHASES_AMOUNT,
  GET_TRACKING_INFO,
  GET_USER_EMAILS,
  RETRIEVE_CUSTOMER_INFO,
  START_TRACKING,
  TRACKING_ERROR,
} from "../actions/types";

const initialState = {
  userInfo: null,
  trackingErrors: null,
  loading: true,
  views: null,
  purchases: null,
  trackingInfo: null,
  userEmails: null,
  customers: null,
};

export const analytics = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case START_TRACKING:
      localStorage.setItem("x20", payload._id);
      return {
        ...state,
        userInfo: payload,
        loading: false,
      };
    case TRACKING_ERROR:
      return {
        ...state,
        trackingErrors: payload,
        loading: false,
      };
    case GET_PAGE_VIEWS:
      return {
        ...state,
        views: payload,
        loading: false,
      };
    case GET_PURCHASES_AMOUNT:
      return {
        ...state,
        purchases: payload,
        loading: false,
      };
    case GET_TRACKING_INFO:
      return {
        ...state,
        trackingInfo: payload,
        loading: false,
      };
    case GET_USER_EMAILS:
      return {
        ...state,
        userEmails: payload,
        loading: false,
      };
    case RETRIEVE_CUSTOMER_INFO:
      return {
        ...state,
        customers: payload,
        loading: false,
      };
    default:
      return state;
  }
};
