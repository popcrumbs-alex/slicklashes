import {
  AUTHENTICATE_USER,
  AUTH_ERROR,
  LOAD_USER,
  LOGOUT,
  SIGNUP,
} from "../actions/types";

const initialState = {
  loading: true,
  isAuthenticated: false,
  user: null,
  authErrors: null,
};

export const auth = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case AUTHENTICATE_USER:
      localStorage.setItem("token", payload);
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
      };
    case SIGNUP:
      localStorage.setItem("token", payload);
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
      };
    case LOAD_USER:
      return {
        ...state,
        user: payload,
        isAuthenticated: true,
        loading: false,
      };
    case LOGOUT:
      localStorage.removeItem("token");
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
      };
    case AUTH_ERROR:
      return {
        ...state,
        authErrors: payload,
        loading: false,
      };
    default:
      return state;
  }
};
