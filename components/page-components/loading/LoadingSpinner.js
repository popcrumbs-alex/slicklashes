import React from "react";
import PropTypes from "prop-types";
import style from "./LoadingSpinner.module.scss";

const LoadingSpinner = (props) => {
  return (
    <div className={style.spinner}>
      <div className={style.barrier}></div>
      <p>Loading...</p>
    </div>
  );
};

LoadingSpinner.propTypes = {};

export default LoadingSpinner;
