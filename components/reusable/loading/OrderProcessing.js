import React from "react";
import PropTypes from "prop-types";
import style from "./OrderProcessing.module.scss";
import { Loader } from "./Loader";
const OrderProcessing = (props) => {
  return (
    <div className={style.loading_container}>
      <div className={style.loading_inner}>
        <Loader />{" "}
        <p>
          Processing Your Order.
          <br /> Please wait...
        </p>
      </div>
    </div>
  );
};

OrderProcessing.propTypes = {};

export default OrderProcessing;
