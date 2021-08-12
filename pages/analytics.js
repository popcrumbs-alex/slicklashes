import React from "react";
import PropTypes from "prop-types";
import { connect, useStore } from "react-redux";
import Dashboard from "../components/analytics/Dashboard";
import Layout from "../components/layout/Layout";
import { useEffect } from "react";
import { useRouter } from "next/router";

const analytics = ({ auth: { isAuthenticated } }) => {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/SigninPage");
    }
  }, [isAuthenticated]);

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

analytics.propTypes = {
  auth: PropTypes.object,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, null)(analytics);
