import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Line } from "react-chartjs-2";
import moment from "moment";
import { Loader } from "../reusable/loading/Loader";
import style from "./EmailsDisplay.module.scss";

const EmailsDisplay = ({ startDate, endDate, data, title }) => {
  const [graphData, setGraphData] = useState({
    labels: [],
    datasets: [],
  });

  const [dateUpdates, update] = useState([]);
  const [labels, setLabels] = useState([]);
  const [matches, setMatches] = useState([]);

  //Filter tracking data to only objects within selected range
  const findDatesInbetweenStartAndEnd = () => {
    const startDateTime = new Date(startDate._d).getTime();
    const endDateTime = new Date(endDate._d).getTime();

    const dataWithinRange = data.filter((dataSet) => {
      const dateToCheck = new Date(dataSet.signupDate).getTime();
      return dateToCheck >= startDateTime && dateToCheck <= endDateTime;
    });

    const sortedDates = dataWithinRange
      .sort((a, b) => {
        const newDateA = new Date(a.signupDate).getTime();
        const newDateB = new Date(b.signupDate).getTime();
        // console.log(newDateA > newDateB);
        return newDateA > newDateB ? 1 : -1;
      })
      .map((dateObj) => dateObj);

    update(sortedDates);
  };

  useEffect(() => {
    if (startDate && endDate) {
      findDatesInbetweenStartAndEnd();
    }
  }, [startDate, endDate]);

  //need to figure out why legend is differenct color
  useEffect(() => {
    const filterDuplicateLabels = () => {
      const labels = [];
      dateUpdates.forEach((date) => {
        labels.includes(
          moment(new Date(date.signupDate)).format("dddd, MMMM Do YYYY")
        )
          ? null
          : labels.push(
              moment(new Date(date.signupDate)).format("dddd, MMMM Do YYYY")
            );
      });

      setLabels(labels);
    };

    if (dateUpdates) filterDuplicateLabels();
  }, [dateUpdates]);

  useEffect(() => {
    const checkAmtOfDuplicates = () => {
      const matches = labels.map(
        (item) =>
          dateUpdates.filter((el) => {
            return (
              moment(new Date(el.signupDate)).format("dddd, MMMM Do YYYY") ===
              item
            );
          }).length
      );

      setMatches(matches);
    };

    if (labels) checkAmtOfDuplicates();
  }, [dateUpdates, labels]);

  useEffect(() => {
    setGraphData((prevData) => ({
      ...prevData,
      labels: labels,
      datasets: [
        {
          label: title,
          backgroundColor: "#880044",
          borderColor: "#8800446e",
          borderWidth: 2,
          data: matches,
          fill: false,
        },
      ],
    }));
  }, [startDate, endDate, labels, matches]);

  return (
    <>
      <div className={style.total_display_heading}>
        <h2> Total Emails Collected Within Range</h2>
        <h1>{data ? "Emails: " + data.length : <Loader />}</h1>
      </div>
      <Line
        data={graphData}
        options={{
          title: {
            display: true,
            text: `${startDate ? startDate._d.toLocaleString() : null} - ${
              endDate ? endDate._d.toLocaleString() : null
            }`,
            fontSize: 15,
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
            position: "bottom",
          },
          responsive: true,
        }}
      />
    </>
  );
};

EmailsDisplay.propTypes = {};

export default EmailsDisplay;
