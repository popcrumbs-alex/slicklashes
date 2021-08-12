import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import style from "./BillingAddress.module.scss";
import { CheckCircle, Circle, Mail } from "react-feather";
import BillingAddressForm from "./BillingAddressForm";
import { connect } from "react-redux";
import { updateBillingAddress } from "../../actions/shopifystore";
import LoadingSpinner from "../loading/LoadingSpinner";

const BillingAddress = ({
  shopifystore: { checkout, loading, billingErrors },
  updateBillingAddress,
}) => {
  const [billingVisibility, toggleVisibility] = useState(false);
  const [isSameAsShipping, resetBilling] = useState(null);
  const [processing, setProcessing] = useState(null);

  const handleBillingReset = () => {
    setProcessing(true);
    updateBillingAddress({
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
      isBillingAddress: true,
    });
  };

  const handleBillingEmpty = () => {
    setProcessing(true);
    updateBillingAddress({
      email: localStorage.getItem("email"),
      address1: "",
      address2: "",
      city: "",
      firstName: "",
      lastName: "",
      phone: "",
      province: "",
      zip: "",
      checkoutId: "",
      isBillingAddress: true,
    });
  };

  useEffect(() => {
    setProcessing(false);
  }, [checkout, billingErrors]);

  console.log("loading", loading);

  if (processing) {
    return (
      <section className={style.section}>
        <LoadingSpinner />
      </section>
    );
  }
  return (
    <section className={style.section}>
      <div className={style.inner}>
        <div className={style.heading}>
          <Mail /> <h2>Billing Address</h2>
        </div>
        <div className={style.billing_address_toggle}>
          <div
            onTouchEnd={(e) => {
              toggleVisibility(false);
              resetBilling(true);
              handleBillingReset();
            }}
            onPointerDown={(e) => {
              toggleVisibility(false);
              resetBilling(true);
              handleBillingReset();
            }}
            className={style.billing_column}
          >
            <div className={style.inner}>
              {!billingVisibility ? (
                <CheckCircle className={style.active} />
              ) : (
                <Circle />
              )}
              <p>Same as shipping address</p>
            </div>
          </div>
          <div
            className={style.billing_column}
            onTouchEnd={(e) => {
              toggleVisibility(true);
              resetBilling(false);
              handleBillingEmpty();
            }}
            onPointerDown={(e) => {
              toggleVisibility(true);
              resetBilling(false);
              handleBillingEmpty();
            }}
          >
            <div className={style.inner}>
              {billingVisibility ? (
                <CheckCircle className={style.active} />
              ) : (
                <Circle />
              )}
              <p>Use a different billing address</p>
            </div>
          </div>

          {!isSameAsShipping && (
            <BillingAddressForm isSameAsShipping={isSameAsShipping} />
          )}
        </div>
      </div>
    </section>
  );
};

BillingAddress.propTypes = {};

const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
});

export default connect(mapStateToProps, { updateBillingAddress })(
  BillingAddress
);
