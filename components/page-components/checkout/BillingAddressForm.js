import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import style from "./ShippingAddress.module.scss";
import { connect } from "react-redux";
import { updateBillingAddress } from "../../actions/shopifystore";
import Input from "../../reusable/forms/input-elements/Input";
import Select from "../../reusable/forms/input-elements/Select";
import { states } from "../../reusable/forms/states";
import { Alert } from "../../reusable/alerts/Alert";
import { Loader } from "../../reusable/loading/Loader";
import {
  loadScript,
  handleAutoComplete,
} from "../../reusable/forms/auto-complete";
import { createTracking } from "../../actions/analytics";

const BillingAddressForm = ({
  shopifystore: { checkout, billingErrors, billingUpdated },
  alert: { alerts },
  updateBillingAddress,
  isSameAsShipping,
  createTracking,
}) => {
  const autoCompleteRef = useRef();

  const [activeInput, setActiveInput] = useState();

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
    email: localStorage.getItem("email"),
    isBillingAddress: true,
  });

  const [processing, setProcessing] = useState(false);

  const {
    address1,
    address2,
    city,
    firstName,
    lastName,
    phone,
    province,
    zip,
    email,
  } = data;

  const onChange = (e) => setData({ ...data, [e.target.name]: e.target.value });

  useEffect(() => {
    if (billingUpdated) setProcessing(false);
    if (billingErrors) setProcessing(false);
  }, [checkout, billingUpdated, billingErrors]);

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
    createTracking({
      checkPoint: "Billing Address Entered",
      userID: localStorage.getItem("x20"),
    });
    updateBillingAddress(data);
  };

  useEffect(() => {
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=AIzaSyDLlAElsGWvEhyjS5stgxFmSkjpv97eVn0&libraries=places`,
      () => handleAutoComplete(setQuery, setAddressData, autoCompleteRef)
    );
  }, []);

  useEffect(() => {
    if (query) setData({ ...data, address1: query });
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
    if (billingUpdated) {
      disableElements(true);
    }
  }, [billingErrors, billingUpdated, isSameAsShipping]);

  if (isSameAsShipping || isSameAsShipping === null) {
    return <></>;
  }

  console.log("is disabled?", isDisabled);
  return (
    <div className={style.billing_container}>
      <form onSubmit={!isDisabled ? (e) => onSubmit(e) : null}>
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
        {alerts.length > 0
          ? alerts.map((alert, i) => {
              return (
                alert.category === "billing" && (
                  <Alert status={alert.type} msg={alert.msg} key={i} />
                )
              );
            })
          : null}
        {processing ? (
          <>
            <p>Saving...</p>
            <Loader />
          </>
        ) : !isDisabled ? (
          <button onSubmit={(e) => onSubmit(e)}>Save</button>
        ) : (
          <button disabled={true} className={style.disabled_btn}>
            Saved
          </button>
        )}
      </form>
    </div>
  );
};

BillingAddressForm.propTypes = {
  updateBillingAddress: PropTypes.func,
};

const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
  alert: state.alert,
});

export default connect(mapStateToProps, {
  updateBillingAddress,
  createTracking,
})(BillingAddressForm);
