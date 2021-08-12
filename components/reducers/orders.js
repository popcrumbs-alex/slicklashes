import {
  CLEAR_ORDER,
  CONNECT_TO_ORDERING,
  FETCH_ORDER,
  ORDER_ERROR,
  SET_ORDER_IN_STORAGE,
} from "../actions/types";

const initialState = {
  foundOrder: null,
  connected: false,
  orderError: null,
  loading: true,
  errors: null,
};

export const orders = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case CONNECT_TO_ORDERING:
      return {
        ...state,
        connected: payload,
        loading: false,
      };
    case FETCH_ORDER:
      return {
        ...state,
        foundOrder: payload,
        loading: false,
      };
    case SET_ORDER_IN_STORAGE:
      localStorage.setItem("order", payload);
      return {
        ...state,
        loading: false,
      };
    case ORDER_ERROR:
      return {
        ...state,
        foundOrder: null,
        errors: payload,
        orderError: payload,
        loading: false,
      };
    case CLEAR_ORDER:
      localStorage.removeItem("order");
      return {
        ...state,
        foundOrder: null,
        loading: false,
      };
    default:
      return state;
  }
};
