import React from "react";
import style from "./LoadingScreen.module.scss";
import { logo } from "../../reusable/logo";

const LoadingScreen = (_) => {
  return (
    <div className={style.container}>
      <div className={style.inner}>
        {logo}
        <p>Loading our hand selected collection</p>
        <div className={style.loaders}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
