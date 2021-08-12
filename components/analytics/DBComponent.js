import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import PageViewsDisplay from "./PageViewsDisplay";
import CheckpointsDisplay from "./CheckpointsDisplay";
import "react-dates/initialize";
import { DateRangePicker } from "react-dates";
import "react-dates/lib/css/_datepicker.css";
import moment from "moment";
import TimeSpentDisplay from "./TimeSpentDisplay";
import PurchasesDisplay from "./PurchasesDisplay";
import EmailsDisplay from "./EmailsDisplay";
import { Loader } from "../reusable/loading/Loader";
const DBComponent = ({
  data,
  title,
  style,
  icon,
  captionColor = "#7ab6f180",
  trackingInfo,
  chartType,
}) => {
  //initiall set dates to a week apart
  const oneWeekAgo = () => {
    const date = new Date();
    const newDate = date.getDate() - 7;
    const pastMonth = date.setDate(newDate);
    return new Date(pastMonth);
  };

  const [processing, setProcessing] = useState(true);
  const [graphType, setGraphType] = useState(null);
  const [dateObj, selectDates] = useState({
    startDate: moment(oneWeekAgo()),
    endDate: moment(new Date()),
  });
  const [focusedInput, setFocused] = useState(["startDate", "endDate"]);

  const handleFocusChange = (e) => {
    setFocused(e.focusedInput);
  };

  const { startDate, endDate } = dateObj;

  useEffect(() => {
    if (data && trackingInfo) {
      switch (true) {
        case title === "Page Views":
          return setGraphType(
            <PageViewsDisplay
              data={data}
              title={title}
              startDate={startDate}
              endDate={endDate}
              trackingInfo={trackingInfo}
            />
          );
        case title === "Drop Off Points":
          return setGraphType(
            <CheckpointsDisplay
              data={data}
              title={title}
              startDate={startDate}
              endDate={endDate}
              trackingInfo={trackingInfo}
            />
          );
        case title === "Average Time Spent On Site":
          console.log("wtf");
          return setGraphType(
            <TimeSpentDisplay
              title={title}
              startDate={startDate}
              endDate={endDate}
              trackingInfo={trackingInfo}
              icon={icon}
            />
          );
        case title === "Purchases":
          return setGraphType(
            <PurchasesDisplay
              title={title}
              startDate={startDate}
              endDate={endDate}
              data={data}
            />
          );
        case title === "Emails Collected":
          return setGraphType(
            <EmailsDisplay
              title={title}
              startDate={startDate}
              endDate={endDate}
              data={data}
            />
          );
        default:
          return () => null;
      }
    }
  }, [startDate, endDate, trackingInfo, data]);

  useEffect(() => {
    if (trackingInfo) setProcessing(false);
  }, [trackingInfo]);

  return (
    <div className={style.metric_display}>
      <div className={style.metric_display__top_level}>
        <div className={style.metric_display__top_level__inner}>
          <div className={style.metric_display__top_level__inner__date}>
            <label>Date Range</label>
            <DateRangePicker
              startDate={startDate} // momentPropTypes.momentObj or null,
              startDateId={`${title}-startDate`} // PropTypes.string.isRequired,
              endDate={endDate} // momentPropTypes.momentObj or null,
              endDateId={`${title}-endDate`} // PropTypes.string.isRequired,
              onDatesChange={({ startDate, endDate }) =>
                selectDates({ startDate, endDate })
              } // PropTypes.func.isRequired,
              focusedInput={focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
              onFocusChange={(focusedInput) =>
                handleFocusChange({ focusedInput })
              } // PropTypes.func.isRequired,
              noBorder={true}
              isOutsideRange={() => false}
            />
          </div>
        </div>
      </div>
      <div className={style.data_display}>
        {!chartType ? (
          <div className={style.data_display__metrics}>
            {icon && icon}
            <h1>{data}</h1>
          </div>
        ) : (
          <div className={style.graph_display}>
            {!processing ? graphType : <Loader />}
          </div>
        )}
      </div>
      <div className={style.caption} style={{ background: captionColor }}>
        <h2>{title}</h2>
      </div>
    </div>
  );
};

DBComponent.propTypes = {
  data: PropTypes.string,
  tite: PropTypes.string,
};

export default DBComponent;
