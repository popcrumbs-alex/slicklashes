import { OPEN_POPUP, POPUP_ERROR } from "../actions/types";

const initialState = {
  opened: false,
  loading: true,
  error: null,
};

export const popup = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case OPEN_POPUP:
      return {
        ...state,
        opened: payload,
        loading: false,
      };
    case POPUP_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
      };
    default:
      return state;
  }
};
