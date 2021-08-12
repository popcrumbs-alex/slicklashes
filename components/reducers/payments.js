import {
  CLEAR_PAYMENT_OBJECT,
  CREATE_INTENT,
  PAYMENT_ERROR,
  SET_PAYMENT_TO_SUCCEED,
  UPDATE_PAYMENT_INTENT,
} from "../actions/types";

const initialState = {
  paymentObject: null,
  loading: true,
  paymentSucceeded: null,
  errors: [],
};

export const payments = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case CREATE_INTENT:
      return {
        ...state,
        paymentObject: payload,
        loading: false,
      };
    case UPDATE_PAYMENT_INTENT:
      return {
        ...state,
        paymentObject: payload,
        loading: false,
      };
    case CLEAR_PAYMENT_OBJECT:
      return {
        ...state,
        paymentObject: null,
        loading: false,
      };
    case PAYMENT_ERROR:
      return {
        ...state,
        errors: payload,
        loading: false,
      };
    case SET_PAYMENT_TO_SUCCEED:
      return {
        ...state,
        paymentSucceeded: payload,
        loading: false,
      };
    default:
      return state;
  }
};
