import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import style from "./EmailSignup.module.scss";
import { signupForEmail } from "../../actions/email";
import { connect } from "react-redux";

const EmailSignup = ({ signupForEmail, email: { emailResponse, errors } }) => {
  const [formData, setFormData] = useState({
    email: "",
  });

  const { email } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    signupForEmail(formData);
  };
  useEffect(() => {
    if (emailResponse && errors === null) {
      setFormData({ email: "" });
    }
  }, [emailResponse, errors]);
  return (
    <form className={style.form} onSubmit={(e) => onSubmit(e)}>
      <input
        type="email"
        placeholder="Please Enter Your Email"
        required={true}
        value={email}
        name="email"
        onChange={(e) => onChange(e)}
      ></input>
      <button onSubmit={(e) => onSubmit(e)}>Submit</button>
    </form>
  );
};

EmailSignup.propTypes = {
  signupForEmail: PropTypes.func,
};

const mapStateToProps = (state) => {
  return {
    email: state.email,
  };
};

export default connect(mapStateToProps, { signupForEmail })(EmailSignup);
