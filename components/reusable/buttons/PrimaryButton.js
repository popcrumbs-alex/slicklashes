import React from "react";
import PropTypes from "prop-types";
import style from "./PrimaryButton.module.scss";

const PrimaryButton = ({
  callback,
  callbackValue,
  text,
  icon,
  analyticsEvent,
  checkpoint,
  userID,
}) => {
  return (
    <button
      className={style.primary_btn}
      onPointerDown={() => {
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

PrimaryButton.propTypes = {
  callback: PropTypes.any,
  text: PropTypes.string,
};

export default PrimaryButton;
