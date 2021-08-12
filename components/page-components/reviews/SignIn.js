import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import style from "./SignIn.module.scss";
import { Alert } from "../../reusable/alerts/Alert";
import { connect } from "react-redux";
import { getPermission, togglePopup } from "../../actions/reviews";
import { logo } from "../../reusable/logo";
import { Loader } from "../../reusable/loading/Loader";

const SignIn = ({
  reviews: { popup, error, authenticated },
  togglePopup,
  alert: { alerts },
  getPermission,
}) => {
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
  });

  const { email } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    getPermission(formData);
  };
  useEffect(() => {
    if (authenticated || error || alerts.length > 0) setProcessing(false);
  }, [authenticated, alerts]);
  console.log(alerts, error);
  return (
    <div className={style.container}>
      <div className={style.inner}>
        <button onClick={() => togglePopup(!popup)} className={style.close_btn}>
          Close X
        </button>
        <div className={style.logo}>{logo}</div>
        <h2>Please enter your email to write a review</h2>
        <p>In order to write a review, you must make a purchase first.</p>

        {(alerts.length > 0 && authenticated) || (alerts.length > 0 && error)
          ? alerts.map((alert, i) => (
              <Alert status={alert.type} msg={alert.msg} />
            ))
          : null}
        <form onSubmit={(e) => onSubmit(e)}>
          <input
            type="text"
            value={email}
            placeholder="Email"
            name="email"
            onChange={(e) => onChange(e)}
            required={true}
          />
          {processing ? <Loader /> : <button>Submit</button>}
        </form>
      </div>
    </div>
  );
};

SignIn.propTypes = {};

const mapStateToProps = (state) => ({
  reviews: state.reviews,
  alert: state.alert,
});

export default connect(mapStateToProps, { togglePopup, getPermission })(SignIn);
