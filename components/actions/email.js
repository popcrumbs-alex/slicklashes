import api from "../../utils/api";
import { SIGNUP_FOR_EMAIL, EMAIL_ERROR } from "./types";
import { setAlert } from "./alert";

export const signupForEmail = (data) => async (dispatch) => {
  try {
    const res = await api.post("/email/signup", data);

    dispatch({
      type: SIGNUP_FOR_EMAIL,
      payload: res.data,
    });
  } catch (error) {
    const errors = error.response.data.errors;
    if (errors) {
      errors.forEach((err) => dispatch(setAlert(err.msg, "danger")));
    }
    dispatch({
      type: EMAIL_ERROR,
      payload: {
        status: error.response.statusText,
        msg: error.response.status,
      },
    });
  }
};
