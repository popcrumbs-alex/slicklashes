import React, { useEffect } from "react";
import Layout from "../components/layout/Layout";
import SignIn from "../components/analytics/auth/SignIn";
import { useRouter } from "next/router";
import { connect } from "react-redux";

const SigninPage = ({ auth: { isAuthenticated } }) => {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/analytics");
    }
  }, [isAuthenticated]);

  return (
    <Layout>
      <SignIn />
    </Layout>
  );
};

SigninPage.propTypes = {};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, null)(SigninPage);
