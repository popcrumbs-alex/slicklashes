import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import style from "./Signin.module.scss";
import Input from "../../reusable/forms/input-elements/Input";
import { Alert } from "../../reusable/alerts/Alert";
import { signIn } from "../../actions/auth";
import { connect } from "react-redux";

const SignIn = ({ signIn, alert: { alerts } }) => {
  const [data, setData] = useState({
    userName: "",
    adminCode: "",
    password: "",
  });

  const { userName, adminCode, password } = data;

  const onChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const formSubmit = (e) => {
    e.preventDefault();

    signIn(data);
  };

  console.log(alerts);
  return (
    <div className={style.container}>
      <div className={style.form_container}>
        <h1>Analytics Login</h1>
        <div className={style.alert_row}>
          {alerts.length > 0
            ? alerts.map((alert, i) => (
                <Alert status={alert.type} msg={alert.msg} key={i} />
              ))
            : null}
        </div>
        <div className={style.inner_container}>
          <form onSubmit={(e) => formSubmit(e)}>
            <Input
              name={"userName"}
              type={"text"}
              isRequired={true}
              placeholderText={"Please enter your user name"}
              value={userName}
              onChange={onChange}
              label={"User Name"}
              inputStyle={style.form_row}
            />
            <Input
              name={"password"}
              type={"password"}
              isRequired={true}
              placeholderText={"Please enter your password"}
              value={password}
              onChange={onChange}
              label={"Password"}
              inputStyle={style.form_row}
            />
            <Input
              name={"adminCode"}
              type={"password"}
              isRequired={true}
              placeholderText={"Please enter the admin authorization"}
              value={adminCode}
              onChange={onChange}
              label={"Admin Code"}
              inputStyle={style.form_row}
            />

            <button onSubmit={(e) => formSubmit}>Login</button>
          </form>
        </div>
      </div>
    </div>
  );
};

SignIn.propTypes = {
  alert: PropTypes.object,
};

const mapStateToProps = (state) => ({
  alert: state.alert,
});

export default connect(mapStateToProps, { signIn })(SignIn);
