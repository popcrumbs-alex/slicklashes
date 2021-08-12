import React from "react";
import style from "./Alert.module.scss";

export const Alert = ({ status, msg }) => {
  // console.log(status, msg);
  return (
    <div
      className={
        status === "danger"
          ? `${style.alert} ${style.danger}`
          : `${style.alert} ${style.success}`
      }
    >
      <div className={style.inner}>
        <p>{msg}</p>
      </div>
    </div>
  );
};
