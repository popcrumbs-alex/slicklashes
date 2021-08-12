import api from "../../utils/api";
import { setAlert } from "./alert";
import {
  CLEAR_ORDER,
  CONNECT_TO_ORDERING,
  FETCH_ORDER,
  ORDER_ERROR,
  SET_ORDER_IN_STORAGE,
} from "./types";

export const fetchOrder = (id) => async (dispatch) => {
  try {
    const res = await api.get(`/store/getorder/${id}`);

    dispatch({
      type: FETCH_ORDER,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: ORDER_ERROR,
      payload: error.response.data.msg,
    });

    dispatch(setAlert(error.response.data.msg, "danger"));
  }
};

export const setOrderToStorage = (id) => async (dispatch) => {
  dispatch({
    type: SET_ORDER_IN_STORAGE,
    payload: id,
  });
};

export const clearOrder = () => async (dispatch) => {
  dispatch({
    type: CLEAR_ORDER,
  });
};

export const setConnection = (val) => async (dispatch) => {
  dispatch({
    type: CONNECT_TO_ORDERING,
    payload: val,
  });
};

export const setOrderError = (error) => async (dispatch) => {
  dispatch({
    type: ORDER_ERROR,
    payload: error,
  });
};
