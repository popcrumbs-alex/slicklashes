import {
  ADD_OR_DECLINE_UPSELL,
  FINISH_ADDON_SELECTION,
  FINISH_UPSELL,
  GET_PRODUCT_SELECT_REF,
  SELECT_PRODUCT,
} from "../actions/types";

const initialState = {
  sectionRef: null,
  sectionLoading: true,
  selectedProduct: null,
  upsellAddedOrDeclined: false,
  finishedUpsell: false,
  addonsSelected: false,
};

export const productSelect = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case GET_PRODUCT_SELECT_REF:
      return {
        ...state,
        sectionRef: payload,
        sectionLoading: false,
      };
    case SELECT_PRODUCT:
      return {
        ...state,
        selectedProduct: payload,
      };
    case ADD_OR_DECLINE_UPSELL:
      return {
        ...state,
        upsellAddedOrDeclined: payload,
      };
    case FINISH_UPSELL:
      return {
        ...state,
        finishedUpsell: payload,
      };
    case FINISH_ADDON_SELECTION:
      return {
        ...state,
        addonsSelected: payload,
      };
    default:
      return state;
  }
};
