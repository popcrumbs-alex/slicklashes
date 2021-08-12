import React from "react";
import { Truck } from "react-feather";
import { logo } from "../../reusable/logo";
import style from "./TopBar.module.scss";

const TopBar = () => {
  return (
    <div className={style.top_bar}>
      <div className={style.top_inner}>{logo}</div>
    </div>
  );
};

export default TopBar;
