import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import moment from "moment";
import { Loader } from "../reusable/loading/Loader";
import style from "./PurchaseDisplay.module.scss";
//TODO display purchase totals on bar graph
const PurchasesDisplay = ({ data, startDate, endDate, title }) => {
  const [graphData, setGraphData] = useState({
    labels: [],
    datasets: [],
  });
  const [dateUpdates, update] = useState([]);
  const [dupeLabels, setDupes] = useState([]);
  const [matchAmts, setMatchAmts] = useState([]);
  const [dataProcessing, setProcessing] = useState(true);
  const [batchData, updateBatch] = useState([]);
  const [totalSales, setTotalSales] = useState("");
  const [totalAmtsByDate, setAmountForDate] = useState([]);
  const { labels, datasets } = graphData;

  //some data objects are multidimensional arrays, need to flatten these with a recursive function
  const findDatesInbetweenStartAndEnd = () => {
    const startDateTime = new Date(startDate._d).getTime();
    const endDateTime = new Date(endDate._d).getTime();

    const flatten = (arr) =>
      arr.reduce(
        (acc, next) => acc.concat(Array.isArray(next) ? flatten(next) : next),
        []
      );

    const flattenedArr = flatten(data);

    const sortedDates = flattenedArr
      .sort((a, b) => {
        const newDateA = new Date(a.orderDate).getTime();
        const newDateB = new Date(b.orderDate).getTime();
        // console.log(newDateA > newDateB);
        return newDateA > newDateB ? 1 : -1;
      })
      .map((dateObj) => dateObj);

    const dataWithinRange = sortedDates.filter((obj) => {
      const date = new Date(obj.orderDate).getTime();
      return date >= startDateTime && date <= endDateTime;
    });

    const orderDates = dataWithinRange.map((item) => item.orderDate);
    //this is for the entire data object
    updateBatch(dataWithinRange);
    //just order dates
    update(orderDates);
  };

  //once data changes, recall this function to find new date ranges
  useEffect(() => {
    if (startDate && endDate && data) {
      //Filter tracking data to only objects within selected range
      findDatesInbetweenStartAndEnd();
    }
  }, [startDate, endDate, data]);

  //set the labels for the graph as one of each duplicate
  //then get the amount of duplicates per label
  //then set the data for the graph
  useEffect(() => {
    const filterDuplicateLabels = () => {
      const labels = [];
      dateUpdates.forEach((date) => {
        //Only format the date this way for UI purposes
        const newDate = moment(new Date(date)).format("dddd, MMM, Do, YYYY");
        labels.includes(newDate) ? null : labels.push(newDate);
      });

      setDupes(labels);
    };

    if (dateUpdates) filterDuplicateLabels();
  }, [dateUpdates]);

  useEffect(() => {
    const checkAmtOfDuplicates = () => {
      const labels = dupeLabels;
      const matches = labels.map(
        (item) =>
          dateUpdates.filter((el) => {
            const newDate = moment(new Date(el)).format("dddd, MMM, Do, YYYY");

            return newDate === item;
          }).length
      );
      const totalOrderAmounts = labels
        .map((label) => {
          return batchData
            .filter((el) => {
              const newDate = moment(new Date(el.orderDate)).format(
                "dddd, MMM, Do, YYYY"
              );
              return newDate === label;
            })
            .reduce((acc, objMatch) => {
              return (acc += objMatch.orderTotal / 100);
            }, 0);
        })
        .map((total) => {
          const totalFormat = `${total.toFixed(2)}`;
          return totalFormat;
        });
      setAmountForDate(totalOrderAmounts);
      setMatchAmts(matches);
    };
    if (dupeLabels) checkAmtOfDuplicates();
  }, [dupeLabels]);

  useEffect(() => {
    setGraphData((prevData) => ({
      ...prevData,
      labels: [...dupeLabels],
      datasets: [
        {
          label: title,
          backgroundColor: "#1294906e",
          borderColor: "#129490",
          borderWidth: 2,
          data: [...matchAmts],
        },
        {
          label: "Purchase Totals $USD",
          backgroundColor: "#ff00ed63",
          borderColor: "#ff00ed",
          borderWidth: 2,
          data: [...totalAmtsByDate],
        },
      ],
    }));
  }, [dupeLabels, matchAmts, startDate, endDate, data]);

  //set loading to false once data has loaded
  useEffect(() => {
    if (labels.length > 0 && datasets.length > 0) {
      setProcessing(false);
    }
  }, [labels, datasets]);

  //update total sales for selected date ranges
  //format order total from  number to money
  useEffect(() => {
    if (batchData) {
      const totalSalesForDateRange = batchData.reduce((acc, item) => {
        return (acc += item.orderTotal);
      }, 0);

      const formattedTotal = "$" + (totalSalesForDateRange / 100).toFixed(2);

      setTotalSales(formattedTotal);
    }
  }, [batchData]);

  return dataProcessing ? (
    <>
      <p>Fetching Data</p>
      <Loader />
    </>
  ) : (
    <>
      <div className={style.total_display_heading}>
        <h2> Total Sales Within Range</h2>
        <h1>{totalSales ? totalSales : <Loader />}</h1>
      </div>
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
    </>
  );
};

PurchasesDisplay.propTypes = {};

export default PurchasesDisplay;
