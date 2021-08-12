import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import style from "./CheckpointsDisplay.module.scss";
import moment from "moment";
const CheckpointsDisplay = ({ startDate, endDate, trackingInfo }) => {
  const [dateUpdates, update] = useState([]);
  const [selectedCheckpoint, selectCheckpoint] = useState("");
  const [checkpoints, setCheckpoints] = useState([]);

  //Filter tracking data to only objects within selected range
  const findDatesInbetweenStartAndEnd = () => {
    const startDateTime = new Date(startDate._d).getTime();
    const endDateTime = new Date(endDate._d).getTime();

    const dataWithinRange = trackingInfo.filter((dataSet) => {
      const dateToCheck = new Date(dataSet.visitDate).getTime();
      return dateToCheck >= startDateTime && dateToCheck <= endDateTime;
    });

    update(dataWithinRange);
  };
  //part of date range module
  useEffect(() => {
    if (startDate && endDate) {
      findDatesInbetweenStartAndEnd();
    }
  }, [startDate, endDate]);

  //initialize graphdata with empty arrays
  const [graphData, setGraphData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    const filterDateLabels = () => {
      const dates = [];

      dateUpdates.forEach((date) => {
        const formattedDate = moment(date.visitDate).format(
          "dddd, MMM, Do, YYYY"
        );
        dates.includes(formattedDate) ? null : dates.push(formattedDate);
      });

      return dates;
    };
    //check for amount of duplicates pertaining to specific checkpoint and make sure
    //it is within the selected date range
    const checkAmtOfDuplicates = () => {
      const dateLbls = filterDateLabels();
      const matches = dateLbls.map((lbl) => {
        return dateUpdates.filter((el) => {
          // console.log(moment(el.visitDate).format("dddd, MMM, Do, YY"), lbl);
          return (
            el.currentCheckPoint === selectedCheckpoint &&
            moment(el.visitDate).format("dddd, MMM, Do, YYYY") === lbl
          );
        }).length;
      });
      return matches;
    };

    setGraphData((prevData) => ({
      ...prevData,
      labels: [...filterDateLabels()],
      datasets: [
        {
          label: selectedCheckpoint,
          backgroundColor: "rgba(122, 182, 241,1)",
          fill: false,
          borderColor: "rgba(122, 182, 241, 0.603)",
          borderWidth: 2,
          data: [...checkAmtOfDuplicates()],
        },
      ],
    }));
  }, [dateUpdates, trackingInfo, startDate, endDate, selectedCheckpoint]);

  //get list of tracking check points
  useEffect(() => {
    if (trackingInfo) {
      const filteredList = [];
      trackingInfo.forEach((info) => {
        filteredList.includes(info.currentCheckPoint)
          ? null
          : filteredList.push(info.currentCheckPoint);
      });
      setCheckpoints(filteredList);
      //set initial checkpoint to first on list
      selectCheckpoint(filteredList[0]);
    }
  }, [trackingInfo]);

  return (
    <>
      <h2>Select a checkpoint</h2>
      <div className={style.checkpoints_display}>
        {checkpoints &&
          checkpoints.map((checkPoint, i) => (
            <button
              className={
                selectedCheckpoint === checkPoint ? style.active : null
              }
              onPointerDown={(e) => selectCheckpoint(checkPoint)}
              key={i}
            >
              {checkPoint}
            </button>
          ))}
      </div>
      <Line
        data={graphData}
        options={{
          title: {
            isplay: true,
            text: selectedCheckpoint,
            fontSize: 20,
          },
          scales: {
            xAxes: [
              {
                ticks: {
                  fontSize: 10,
                },
              },
            ],
          },
          legend: {
            display: true,
            position: "top",
          },
          responsive: true,
        }}
      />
    </>
  );
};

CheckpointsDisplay.propTypes = {};

export default CheckpointsDisplay;
