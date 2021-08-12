import { SIGNUP_FOR_EMAIL, EMAIL_ERROR } from "../actions/types";

const initialState = {
  emailResponse: null,
  errors: null,
  loading: false,
};

export const email = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case SIGNUP_FOR_EMAIL:
      return {
        ...state,
        emailResponse: payload,
        loading: false,
      };
    case EMAIL_ERROR:
      return {
        ...state,
        errors: payload,
        loading: false,
      };
    default:
      return state;
  }
};
