import React from "react";
import PropTypes from "prop-types";
import PrimaryButton from "../buttons/PrimaryButton";
import { AlertCircle } from "react-feather";
import { useRouter } from "next/router";
import style from "./ErrorPage.module.scss";

const ErrorPage = ({ redirectRoute = "/" }) => {
  const router = useRouter();

  const handleRedirectBack = (route) => {
    return router.push(route);
  };

  return (
    <section className={style.section}>
      <div className={style.inner}>
        <div className={style.iconContainer}>
          <AlertCircle size={105} />
        </div>
        <h1 className={style.heading}>Hmmmm... Something went wrong.</h1>
        <div className={style.buttonContainer}>
          <PrimaryButton
            text={"Click Here To Go Back"}
            callback={handleRedirectBack}
            callbackValue={redirectRoute}
          />
        </div>
      </div>
    </section>
  );
};

ErrorPage.propTypes = {};

export default ErrorPage;
