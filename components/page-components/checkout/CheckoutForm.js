import React, { createRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import style from "./CheckoutForm.module.scss";
import { connect } from "react-redux";
import {
  createIntent,
  setPaymentSucceeded,
  updatePaymentIntent,
} from "../../actions/payments";

import { FaRegCreditCard, FaPaypal } from "react-icons/fa";
import { createTracking } from "../../actions/analytics";
import BillingAddress from "./BillingAddress";
import PayPal from "./paypal/PayPal";
import CreditCard from "./credit/CreditCard";
import ReactGA from "react-ga";

const CheckoutForm = ({
  shopifystore: { loading, cart, checkout, errors },
  createIntent,
  updatePaymentIntent,
  payments: { paymentObject },
  setPaymentSucceeded,
  createTracking,
}) => {
  const stepRef = createRef();
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [selected, toggleSelected] = useState("credit");

  const [clientObject, setClientSecret] = useState({
    clientSecret: "",
    checkoutId: checkout.id,
  });

  const stripe = useStripe();
  const elements = useElements();

  const { clientSecret, checkoutId } = clientObject;

  //create a payment intent
  //shipping cost is a whole number not a float
  useEffect(() => {
    if (cart.length > 0 && !loading && checkoutId)
      createIntent({
        items: cart,
        checkoutId,
        shippingPrice: "0",
        tax: checkout.totalTax,
        email: checkout.customAttributes.filter(
          (attr) => attr.key === "email"
        )[0].value,
        name: localStorage.getItem("name"),
        shippingAddress: checkout.shippingAddress,
      });
  }, []);

  const handleChange = async (event) => {
    // Listen for changes in the CardElement
    // and display any errors as the customer types their card details
    setDisabled(event.empty);
    setError(event.error ? event.error.message : "");
  };

  useEffect(() => {
    if (paymentObject)
      setClientSecret({
        clientSecret: paymentObject.clientSecret,
        checkoutId: checkout.id,
      });
  }, [paymentObject]);

  //credit card submit event handler
  const handleSubmit = async (event) => {
    event.preventDefault();

    //checkpoint for order process
    createTracking({
      checkPoint: "Order Processing",
      userID: localStorage.getItem("x20"),
    });

    setProcessing(true);

    if (errors) {
      setProcessing(false);
      console.error("what error is this?", errors);
      errors.forEach((err) => setError(err.msg));
      return;
    }
    if (!checkout.shippingAddress) {
      setProcessing(false);
      console.error("shipping errors");
      return setError("Please save your shipping address");
    }

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      setDisabled(true);
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);

    // Use your card Element with other Stripe.js APIs
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      console.log("stripe [error]", error);
      setProcessing(false);
    } else {
      //Possibly don't send confirmation but send
      const payload = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      console.log("stripe payload", payload);
      if (payload.error) {
        setError(`Payment failed ${payload.error.message}`);
        setProcessing(false);
        setPaymentSucceeded(false);
        createTracking({
          checkPoint: "Order Payment Error",
          userID: localStorage.getItem("x20"),
        });
        ReactGA.event({ category: "User", action: "Payment Failure" });
      } else {
        setError(null);
        setSucceeded(true);
        setProcessing(false);
        setPaymentSucceeded(true);
        createTracking({
          checkPoint: "Order Payment Succeeded",
          userID: localStorage.getItem("x20"),
        });
        ReactGA.event({
          category: "User",
          action: "Payment Success, Order Processing",
        });
      }
    }
  };

  //update stripe payment intent
  //pass the current paymentDue
  //shippingPrice Must be a string
  useEffect(() => {
    if (paymentObject && paymentObject.id) {
      updatePaymentIntent({
        items: checkout.lineItems,
        shippingPrice: "0",
        paymentIntentId: paymentObject.id,
        tax: checkout.totalTax.toString(),
        email: checkout.customAttributes.filter(
          (attr) => attr.key === "email"
        )[0].value,
        name: checkout.shippingAddress ? checkout.shippingAddress.name : "",
        shippingAddress: checkout.shippingAddress,
      });
    }
  }, [checkout.totalTax, checkout.shippingAddress]);

  useEffect(() => {
    if (stepRef.current) {
      stepRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [stepRef, error]);

  useEffect(() => {
    //initialize checkout tracking
    ReactGA.event({ category: "User", action: "Checkout Begin" });
  }, []);

  return (
    <div className={style.form_container} ref={stepRef}>
      <div className={style.heading}>
        <div className={style.inner}>
          <FaRegCreditCard />
          <div className={style.column}>
            <h2>Payment Information</h2>{" "}
            <p>All transactions are secure and encrypted.</p>
          </div>
        </div>
      </div>

      <div className={style.checkout_toggle}>
        <div className={style.inner}>
          <div
            className={style.inner_row}
            onPointerDown={(e) => toggleSelected("credit")}
          >
            <button
              onPointerDown={(e) => toggleSelected("credit")}
              className={selected === "credit" && style.selected}
            ></button>
            <h2>Credit Card</h2>
          </div>

          {selected === "credit" && (
            <div className={style.inner_col}>
              <CreditCard
                error={error}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                processing={processing}
                style={style}
                stripe={stripe}
              />
            </div>
          )}
        </div>
        <div className={style.inner}>
          <div
            className={style.inner_row}
            onPointerDown={(e) => toggleSelected("paypal")}
          >
            <button
              onPointerDown={(e) => toggleSelected("paypal")}
              className={selected === "paypal" && style.selected}
            ></button>
            <FaPaypal />
            <h2>Paypal</h2>
          </div>
          {selected === "paypal" && (
            <div className={style.inner_col}>
              <PayPal />
            </div>
          )}
        </div>
      </div>

      <BillingAddress />
    </div>
  );
};

CheckoutForm.propTypes = {
  loading: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
  payments: state.payments,
});

export default connect(mapStateToProps, {
  createIntent,
  updatePaymentIntent,
  setPaymentSucceeded,
  createTracking,
})(CheckoutForm);
