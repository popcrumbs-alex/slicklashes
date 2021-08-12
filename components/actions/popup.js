import { OPEN_POPUP, POPUP_ERROR } from "./types";

export const openPopup = (val) => async (dispatch) => {
  try {
    dispatch({ type: OPEN_POPUP, payload: val });
  } catch (error) {
    dispatch({
      type: POPUP_ERROR,
      payload: error.response.data.msg,
    });
  }
};
