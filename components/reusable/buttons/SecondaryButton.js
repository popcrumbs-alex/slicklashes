import React from "react";
import PropTypes from "prop-types";
import style from "./SecondaryButton.module.scss";

const SecondaryButton = ({
  callback,
  callbackValue = null,
  text = "",
  icon = null,
  analyticsEvent,
  checkpoint = "",
  userID = "",
}) => {
  return (
    <button
      className={style.secondary_btn}
      onPointerDown={() => {
        callback(callbackValue);
        if (analyticsEvent) {
          analyticsEvent({
            checkpoint,
            userID,
          });
        }
      }}
      onTouchEnd={() => {
        callback(callbackValue);
        if (analyticsEvent) {
          analyticsEvent({
            checkpoint,
            userID,
          });
        }
      }}
    >
      {text} {icon && icon}
    </button>
  );
};

SecondaryButton.propTypes = {
  callback: PropTypes.any,
  text: PropTypes.string,
};

export default SecondaryButton;
