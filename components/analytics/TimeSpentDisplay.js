import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import style from "./Dashboard.module.scss";

const TimeSpentDisplay = ({
  title,
  trackingInfo,
  startDate,
  endDate,
  icon,
}) => {
  const [averageTime, setAvgTime] = useState("00h:00m:00s");
  useEffect(() => {
    const timeArr = trackingInfo.map((info) => {
      const start = parseFloat(info.startTime);
      const end = parseFloat(info.endTime);
      const newDate = new Date((end - start) / 2);
      // console.log(
      //   "TIME",
      //   newDate.getHours(),
      //   newDate.getMinutes(),
      //   newDate.getSeconds()
      // );
      return {
        hours: newDate.getHours(),
        minutes: newDate.getMinutes(),
        seconds: newDate.getSeconds(),
      };
    });

    const avgHours = timeArr.reduce((acc, time) => {
      return (acc += time.hours) % 2;
    }, 0);

    const avgMinutes = timeArr.reduce((acc, time) => {
      return (acc += time.minutes);
    }, 0);

    const avgSeconds = timeArr.reduce((acc, time) => {
      return (acc += time.seconds);
    }, 0);

    const formattedAvgTime =
      Math.round(avgHours / timeArr.length) +
      "h" +
      ":" +
      Math.round(avgMinutes / timeArr.length) +
      "m" +
      ":" +
      Math.round(avgSeconds / timeArr.length) +
      "s";

    // const avgTime = new Date(
    //   Math.floor(timeTotal / trackingInfo.length)
    // ).getSeconds();

    setAvgTime(formattedAvgTime);
  }, [startDate, endDate]);

  return (
    <div className={style.non_graph}>
      {icon && icon}
      <h1>{averageTime}</h1>
    </div>
  );
};

TimeSpentDisplay.propTypes = {};

export default TimeSpentDisplay;
