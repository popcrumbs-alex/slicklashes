import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import style from "./ShippingAddress.module.scss";
import { connect } from "react-redux";
import { updateAddress } from "../../actions/shopifystore";
import Input from "../../reusable/forms/input-elements/Input";
import Select from "../../reusable/forms/input-elements/Select";
import { states } from "../../reusable/forms/states";
import { Alert } from "../../reusable/alerts/Alert";
import { Loader } from "../../reusable/loading/Loader";
import {
  loadScript,
  handleAutoComplete,
} from "../../reusable/forms/auto-complete";
import { FaShippingFast } from "react-icons/fa";
import { createTracking } from "../../actions/analytics";
import { signupForEmail } from "../../actions/email";
import { createRef } from "react";
import ReactGA from "react-ga";

const ShippingAddress = ({
  shopifystore: { checkout, shippingErrors, shippingUpdated },
  alert: { alerts },
  updateAddress,
  createTracking,
  signupForEmail,
}) => {
  const autoCompleteRef = useRef();
  const stepRef = createRef();
  const [activeInput, setActiveInput] = useState(null);
  const [isDisabled, disableElements] = useState(false);

  //handle input focusing for active elements
  const handleActiveInputEvents = (evt) => {
    const childNodes = [...evt.target.childNodes];

    if (childNodes.filter((node) => node.nodeName === "INPUT").length > 0) {
      const foundNodeValue = childNodes
        .map(
          (node) =>
            [...node.attributes].filter((attr) => attr.name === "name")[0]
        )
        .filter((node) => typeof node !== "undefined")[0].value;

      setActiveInput(foundNodeValue);
    } else setActiveInput(evt.target.name);
  };

  const [data, setData] = useState({
    address1: "",
    address2: "",
    city: "",
    firstName: "",
    lastName: "",
    phone: "",
    province: "",
    zip: "",
    checkoutId: checkout.id,
    email: "",
    isBillingAddress: false,
  });

  const [processing, setProcessing] = useState(false);

  const { address2, city, firstName, lastName, phone, province, zip, email } =
    data;

  const onChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  useEffect(() => {
    if (shippingUpdated) setProcessing(false);
    if (shippingErrors) setProcessing(false);
  }, [checkout, shippingUpdated, shippingErrors]);

  useEffect(() => {
    if (checkout.shippingAddress) {
      setData({
        email: localStorage.getItem("email"),
        address1: checkout.shippingAddress.address1,
        address2: checkout.shippingAddress.address2,
        city: checkout.shippingAddress.city,
        firstName: checkout.shippingAddress.firstName,
        lastName: checkout.shippingAddress.lastName,
        phone: checkout.shippingAddress.phone,
        province: checkout.shippingAddress.province,
        zip: checkout.shippingAddress.zip,
        checkoutId: checkout.id,
        isBillingAddress: false,
      });
      setQuery(checkout.shippingAddress.address1);
    }
  }, []);

  //setting email and name to local storage on update
  useEffect(() => {
    if (data) {
      localStorage.setItem("email", email);
      localStorage.setItem("name", firstName + " " + lastName);
    }
  }, [data]);

  /////////////////////////////
  /////////////////////////////
  /////////////////////////////
  /////////////////////////////
  /////////////////////////////
  /////////////////////////////
  /////////////////////////////
  /////////////////////////////
  /////////////////////////////
  //google autocomplete config
  const [query, setQuery] = useState("");
  const [addressData, setAddressData] = useState([]);

  const onQueryChange = (e) => setQuery(e.target.value);

  const onSubmit = (e) => {
    e.preventDefault();

    setProcessing(true);
    //show that this step was hit in analytics
    createTracking({
      checkPoint: "Shipping Address Entered",
      userID: localStorage.getItem("x20"),
    });
    //gtm tracking for address input
    window?.dataLayer.push({ event: "addAddress" });
    //google analytics tracking
    ReactGA.event({ category: "User", action: "Shipping Address Entered" });
    console.log("address-added", window?.dataLayer);
    //send email signup ojbect for klaviyo
    signupForEmail({ email: data.email });
    //save the user's address data
    updateAddress(data);
  };

  useEffect(() => {
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=AIzaSyDLlAElsGWvEhyjS5stgxFmSkjpv97eVn0&libraries=places`,
      () => handleAutoComplete(setQuery, setAddressData, autoCompleteRef)
    );
  }, []);

  useEffect(() => {
    if (query) setData({ ...data, address1: query });
    console.log("address data", addressData);
    if (addressData && addressData.length > 0) {
      const city = addressData.filter(
        (obj) =>
          obj.types.includes("locality") || obj.types.includes("sublocality")
      )[0];
      const streetNumber = addressData.filter((obj) =>
        obj.types.includes("street_number")
      )[0];
      const street = addressData.filter((obj) =>
        obj.types.includes("route")
      )[0];
      const state = addressData.filter((obj) =>
        obj.types.includes("administrative_area_level_1")
      )[0];
      const zipCode = addressData.filter((obj) =>
        obj.types.includes("postal_code")
      )[0];

      setData({
        ...data,
        address1: `${streetNumber && streetNumber.long_name} ${
          street && street.long_name
        }`,
        city: city && city.long_name,
        province: state && state.long_name,
        zip: zipCode && zipCode.long_name,
      });
    }
  }, [query, addressData]);

  //handle deactivation of form
  useEffect(() => {
    if (!shippingErrors && shippingUpdated) {
      disableElements(true);
    }
  }, [shippingErrors, shippingUpdated]);

  // scroll to this section on render

  return (
    <div className={style.address_container}>
      <div className={style.heading}>
        <div className={style.inner}>
          <FaShippingFast />
          <h2>Shipping Information</h2>
        </div>
      </div>
      <form onSubmit={!isDisabled ? (e) => onSubmit(e) : null}>
        <Input
          value={email}
          type={"email"}
          name={"email"}
          onChange={onChange}
          isRequired={true}
          placeholderText={"Email"}
          label={"Email"}
          inputStyle={style.input_col}
          onFocus={handleActiveInputEvents}
          activeElement={activeInput}
          activeStyle={style.active_input}
          autoFocus={true}
          isDisabled={isDisabled}
        />
        <div className={style.form_row}>
          <Input
            value={firstName}
            type={"text"}
            name={"firstName"}
            onChange={onChange}
            isRequired={true}
            placeholderText={"First Name"}
            label={"First Name"}
            inputStyle={style.input_col}
            onFocus={handleActiveInputEvents}
            activeElement={activeInput}
            activeStyle={style.active_input}
            isDisabled={isDisabled}
          />
          <Input
            value={lastName}
            type={"text"}
            name={"lastName"}
            onChange={onChange}
            isRequired={true}
            placeholderText={"Last Name"}
            label={"Last Name"}
            inputStyle={style.input_col}
            onFocus={handleActiveInputEvents}
            activeElement={activeInput}
            activeStyle={style.active_input}
            isDisabled={isDisabled}
          />
        </div>
        {/* this input handles the autocomplete */}

        <Input
          value={query}
          type={"text"}
          name={"query"}
          onChange={onQueryChange}
          isRequired={true}
          placeholderText={"Address"}
          label={"Address"}
          inputStyle={style.input_col}
          id={"autocomplete"}
          inputRef={autoCompleteRef}
          onFocus={handleActiveInputEvents}
          activeElement={activeInput}
          activeStyle={style.active_input}
          isDisabled={isDisabled}
        />
        <Input
          value={address2}
          type={"text"}
          name={"address2"}
          onChange={onChange}
          isRequired={false}
          placeholderText={"Apt/Suite (optional)"}
          label={"Address Line 2 (apt/suite)"}
          inputStyle={style.input_col}
          id={"autocomplete"}
          // onFocus={geolocate}
          onFocus={handleActiveInputEvents}
          activeElement={activeInput}
          activeStyle={style.active_input}
          isDisabled={isDisabled}
        />

        <Input
          value={phone}
          type={"tel"}
          name={"phone"}
          onChange={onChange}
          isRequired={true}
          placeholderText={"Phone "}
          label={"Phone"}
          inputStyle={style.input_col}
          onFocus={handleActiveInputEvents}
          activeElement={activeInput}
          activeStyle={style.active_input}
          isDisabled={isDisabled}
        />
        <Input
          value={city}
          type={"text"}
          name={"city"}
          onChange={onChange}
          isRequired={true}
          placeholderText={"City"}
          label={"City"}
          inputStyle={style.input_col}
          id={"locality"}
          onFocus={handleActiveInputEvents}
          activeElement={activeInput}
          activeStyle={style.active_input}
          isDisabled={isDisabled}
        />

        <div className={style.form_row}>
          <Select
            value={province}
            onChange={onChange}
            isRequired={true}
            options={states}
            placeHolder={"State"}
            label={"State"}
            inputStyle={style.input_col}
            name={"province"}
            id={"administrative_area_level_1"}
            onFocus={handleActiveInputEvents}
            activeElement={activeInput}
            activeStyle={style.active_input}
            isDisabled={isDisabled}
          />
          <Input
            value={zip}
            type={"text"}
            name={"zip"}
            onChange={onChange}
            isRequired={true}
            placeholderText={"Zip Code"}
            label={"Zip Code"}
            inputStyle={style.input_col}
            id={"postal_code"}
            onFocus={handleActiveInputEvents}
            activeElement={activeInput}
            activeStyle={style.active_input}
            isDisabled={isDisabled}
          />
        </div>
        {alerts.length > 0 &&
          alerts.map((alert, i) => {
            return alert.category === "shipping" ? (
              <Alert status={alert.type} msg={alert.msg} key={i} />
            ) : null;
          })}
        {processing ? (
          <>
            <p>Saving...</p>
            <Loader />
          </>
        ) : !isDisabled ? (
          <button onSubmit={(e) => onSubmit(e)}>Next</button>
        ) : (
          <button className={style.disabled_btn} disabled={true}>
            Saved
          </button>
        )}
      </form>
    </div>
  );
};

ShippingAddress.propTypes = {
  updateAddress: PropTypes.func,
};

const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
  alert: state.alert,
});

export default connect(mapStateToProps, {
  updateAddress,
  createTracking,
  signupForEmail,
})(ShippingAddress);
