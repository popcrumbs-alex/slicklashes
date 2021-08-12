import { TOGGLE_UPSELL } from "../actions/types";

const initialState = {
  showUpsell: false,
  loading: true,
  upsellProduct: null,
};

export const upsell = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case TOGGLE_UPSELL:
      return {
        ...state,
        showUpsell: true,
        loading: false,
      };
    default:
      return state;
  }
};
