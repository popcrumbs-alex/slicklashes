import React from "react";
import PropTypes from "prop-types";
import Layout from "../components/layout/Layout";
import Signup from "../components/analytics/auth/Signup";

const signuppage = (props) => {
  return (
    <Layout>
      <Signup />
    </Layout>
  );
};

signuppage.propTypes = {};

export default signuppage;
