import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import moment from "moment";

const PageViewsDisplay = ({
  startDate,
  endDate,
  title,
  data,
  trackingInfo,
}) => {
  const [graphData, setGraphData] = useState({
    labels: [],
    datasets: [],
  });

  const [dateUpdates, update] = useState([]);

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
          moment(new Date(date.visitDate)).format("dddd, MMMM Do YYYY")
        )
          ? null
          : labels.push(
              moment(new Date(date.visitDate)).format("dddd, MMMM Do YYYY")
            );
      });

      return labels;
    };

    const checkAmtOfDuplicates = () => {
      const labels = filterDuplicateLabels();

      const matches = labels.map(
        (item) =>
          dateUpdates.filter((el) => {
            return (
              moment(new Date(el.visitDate)).format("dddd, MMMM Do YYYY") ===
              item
            );
          }).length
      );

      return matches;
    };
    setGraphData((prevData) => ({
      labels: [...filterDuplicateLabels()],
      datasets: [
        {
          label: title,
          backgroundColor: "#ff00ee80",
          borderColor: "#ff00ed",
          borderWidth: 2,
          data: [...checkAmtOfDuplicates()],
        },
      ],
    }));
  }, [dateUpdates, startDate, endDate, trackingInfo]);

  return (
    <Bar
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
  );
};

PageViewsDisplay.propTypes = {
  graphData: PropTypes.object,
};

export default PageViewsDisplay;
