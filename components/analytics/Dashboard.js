import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { useRouter } from "next/router";
import style from "./Dashboard.module.scss";
import io from "socket.io-client";
import { socketEndpoint } from "../../utils/api";
import DBComponent from "./DBComponent";
import {
  DollarSign,
  Mail,
  Monitor,
  TrendingUp,
  Users,
  Watch,
} from "react-feather";
import {
  getPageViews,
  getPurchaseAmount,
  getTrackingInfo,
  getUserEmails,
  retrieveCustomerInfo,
} from "../actions/analytics";
const socket = io(socketEndpoint);

const Dashboard = ({
  auth: { isAuthenticated },
  getPageViews,
  analytics: { views, loading, purchases, userEmails, trackingInfo, customers },
  getPurchaseAmount,
  getUserEmails,
  getTrackingInfo,
  retrieveCustomerInfo,
}) => {
  const router = useRouter();
  const [activeUserCount, setCount] = useState(0);
  const [viewsAmt, setViewAmt] = useState(0);
  const [purchaseAmt, setPurchaseAmt] = useState(0);
  const [customerData, setCustomerData] = useState(null);
  const [checkPoints, setCheckPoints] = useState([]);
  const [trackingData, setData] = useState(null);

  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/SigninPage");
    }
  }, [isAuthenticated, loading]);

  //get user count
  useEffect(() => {
    socket.on("getactiveusers", (data) => {
      // console.log(data);
      setCount(data);
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      //get total page views
      getPageViews();
      //get total amount of purchases
      getPurchaseAmount();
      //get user email count
      getUserEmails();
      //Get tracking data
      getTrackingInfo();
      //get all customer's info
      retrieveCustomerInfo();
    }
  }, [isAuthenticated]);

  //set view amt
  useEffect(() => {
    if (views) setViewAmt(views.length);
    if (purchases) setPurchaseAmt(purchases);
    if (trackingInfo) {
      setCheckPoints(
        trackingInfo.map((checkpoint) => checkpoint.currentCheckPoint)
      );
      setData(trackingInfo);
    }
    if (customers) setCustomerData(customers);
  }, [views, purchases, userEmails, trackingInfo, customers]);

  const components = [
    {
      title: "Active User Count",
      data: activeUserCount,
      style: style,
      icon: <Users />,
      captionColor: "#7ab6f180",
    },
    {
      title: "Average Time Spent On Site",
      data: "something",
      style: style,
      icon: <Watch />,
      chartType: "pie",
      captionColor: "#5158BB",
    },
    {
      title: "Drop Off Points",
      data: checkPoints,
      style: style,
      icon: <TrendingUp />,
      captionColor: "#7fd1b9ad",
      chartType: "pie",
    },
    {
      title: "Page Views",
      data: viewsAmt,
      style: style,
      icon: <Monitor />,
      captionColor: "#DE6E4B",
      chartType: "bar",
    },
    {
      title: "Purchases",
      data: purchaseAmt,
      style: style,
      icon: <DollarSign />,
      captionColor: "#129490",
      chartType: "bar",
    },
    {
      title: "Emails Collected",
      data: customerData,
      style: style,
      icon: <Mail />,
      captionColor: "#880044",
      chartType: "bubble",
    },
  ];

  return (
    <div className={style.dashboard}>
      <div className={style.dashboard__inner}>
        {!loading &&
          components.map((comp, i) => {
            return (
              <DBComponent
                title={comp.title}
                data={comp.data}
                style={comp.style}
                icon={comp.icon}
                trackingInfo={trackingInfo}
                chartType={comp.chartType}
                captionColor={comp.captionColor}
                key={i}
              />
            );
          })}
      </div>
    </div>
  );
};

Dashboard.propTypes = {
  auth: {
    isAuthenticated: PropTypes.bool,
  },
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  analytics: state.analytics,
});

export default connect(mapStateToProps, {
  getPageViews,
  getPurchaseAmount,
  getUserEmails,
  getTrackingInfo,
  retrieveCustomerInfo,
})(Dashboard);
