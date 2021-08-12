import {
  ADD_OR_DECLINE_UPSELL,
  FINISH_UPSELL,
  GET_PRODUCT_SELECT_REF,
  SELECT_PRODUCT,
  FINISH_ADDON_SELECTION,
} from "./types";

export const setSectionRef = (ref) => async (dispatch) => {
  dispatch({
    type: GET_PRODUCT_SELECT_REF,
    payload: ref,
  });
};

export const selectProduct = (product) => async (dispatch) => {
  dispatch({
    type: SELECT_PRODUCT,
    payload: product,
  });
};

export const addOrDeclineUpsell = (value) => async (dispatch) => {
  dispatch({
    type: ADD_OR_DECLINE_UPSELL,
    payload: value,
  });
};
export const finishUpsellStep = (val) => async (dispatch) => {
  dispatch({
    type: FINISH_UPSELL,
    payload: val,
  });
};

export const finishAddOnSelection = (val) => async (dispatch) => {
  dispatch({
    type: FINISH_ADDON_SELECTION,
    payload: val,
  });
};
