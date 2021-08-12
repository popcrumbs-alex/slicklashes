import {
  LOAD_USER,
  AUTHENTICATE_USER,
  AUTH_ERROR,
  LOGOUT,
  SIGNUP,
} from "./types";
import api from "../../utils/api";
import { setAlert } from "./alert";
import setAuthToken from "../../utils/setAuthToken";
import Router from "next/router";

export const loadUser = () => async (dispatch) => {
  const token = localStorage.getItem("token");

  if (token) {
    setAuthToken(token);
  }
  try {
    const res = await api.get("/auth/admin");

    dispatch({
      type: LOAD_USER,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
      payload: error.response.data.msg,
    });
    dispatch(setAlert(error.response.data.msg, "danger"));
  }
};

export const signIn = (formData) => async (dispatch) => {
  try {
    const res = await api.post("/auth/authenticate", formData);
    console.log("THIS IS THE JSON TOKEN", res.data);
    dispatch({
      type: AUTHENTICATE_USER,
      payload: res.data,
    });

    dispatch(loadUser());

    Router.push("/analytics");

    dispatch(setAlert("Welcome to the analytics dashboard", "success"));
  } catch (error) {
    console.log("THIS IS AN AUTH ERROR", error);
    const errors = error.response.data.errors;
    if (errors) {
      dispatch({
        type: AUTH_ERROR,
        payload: errors.forEach((err) => err.msg),
      });
      errors.forEach((err) => dispatch(setAlert(err.msg, "danger")));
    }
    dispatch({
      type: AUTH_ERROR,
      payload: error.response.data.msg,
    });
    dispatch(setAlert(error.response.data.msg, "danger"));
  }
};

export const signup = (formData) => async (dispatch) => {
  try {
    const res = await api.post("/auth/createuser", formData);

    dispatch({
      type: SIGNUP,
      payload: res.data,
    });

    Router.push("/analytics");

    dispatch(setAlert("Signup successful", "success"));
  } catch (error) {
    const errors = error.response.data.errors;
    if (errors) {
      dispatch({
        type: AUTH_ERROR,
        payload: errors.forEach((err) => err.msg),
      });
      errors.forEach((err) => dispatch(setAlert(err.msg, "danger")));
    }
    dispatch({
      type: AUTH_ERROR,
      payload: error.response.data.msg,
    });
    dispatch(setAlert(error.response.data.msg, "danger"));
  }
};

export const logout = () => async (dispatch) => {
  try {
    dispatch({
      type: LOGOUT,
    });
    dispatch(setAlert("You have been logged out.", "success"));
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
      payload: error.response.data.msg,
    });
    dispatch(setAlert(error.response.data.msg, "danger"));
  }
};
