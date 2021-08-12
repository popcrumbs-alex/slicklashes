import { DISCONNECT_USER_FROM_SOCKET } from "../actions/types";

const initialState = {
  disconnected: false,
};

export const socket = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case DISCONNECT_USER_FROM_SOCKET:
      return {
        ...state,
        disconnected: true,
      };
    default:
      return state;
  }
};
