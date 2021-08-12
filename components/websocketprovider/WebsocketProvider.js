import React, { useEffect } from "react";
import PropTypes from "prop-types";
import io from "socket.io-client";
import { socketEndpoint } from "../../utils/api";
const socket = io(socketEndpoint);
import { loadUser } from "../actions/auth";
import { connect } from "react-redux";

const WebsocketProvider = ({ children, loadUser }) => {
  //connect to websocket
  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to socket:" + socket.id);
    });
  }, []);

  //handle persistent auth
  //If token exists load the user
  useEffect(() => {
    if (typeof window !== "window") {
      const token = localStorage.getItem("token");
      if (token) {
        loadUser();
      }
    }
  }, []);

  return <>{children}</>;
};

WebsocketProvider.propTypes = {};

export default connect(null, { loadUser })(WebsocketProvider);
