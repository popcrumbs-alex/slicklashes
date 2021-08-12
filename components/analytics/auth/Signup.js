import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import style from "./Signin.module.scss";
import Input from "../../reusable/forms/input-elements/Input";
import { signup } from "../../actions/auth";
import { connect } from "react-redux";
import { Alert } from "../../reusable/alerts/Alert";
const Signup = ({ signup, alert: { alerts } }) => {
  const [data, setData] = useState({
    userName: "",
    adminCode: "",
    password: "",
    password2: "",
    name: "",
    email: "",
  });

  const { userName, adminCode, password, password2, name, email } = data;

  const onChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  const formSubmit = (e) => {
    e.preventDefault();

    signup(data);
  };

  return (
    <div className={style.container}>
      <div className={style.form_container}>
        <h1>Analytics Account Creation</h1>
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
              name={"email"}
              type={"email"}
              isRequired={true}
              placeholderText={"Please enter your email"}
              value={email}
              onChange={onChange}
              label={"Email"}
              inputStyle={style.form_row}
            />
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
              name={"name"}
              type={"text"}
              isRequired={true}
              placeholderText={"Please enter your name"}
              value={name}
              onChange={onChange}
              label={"Name"}
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
              name={"password2"}
              type={"password"}
              isRequired={true}
              placeholderText={"Please confirm your password"}
              value={password2}
              onChange={onChange}
              label={"Password Confirmation"}
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

            <button onSubmit={(e) => formSubmit}>Create Account</button>
          </form>
        </div>
      </div>
    </div>
  );
};

Signup.propTypes = {};

const mapStateToProps = (state) => ({
  alert: state.alert,
});

export default connect(mapStateToProps, { signup })(Signup);
