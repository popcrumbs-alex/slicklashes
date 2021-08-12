import React from "react";
import PropTypes from "prop-types";
import CreditCards from "./CreditCards";
import { Alert } from "../../../reusable/alerts/Alert";
import {
  FaCcAmex,
  FaCcDinersClub,
  FaCcDiscover,
  FaCcMastercard,
  FaCcVisa,
} from "react-icons/fa";
import { CardElement } from "@stripe/react-stripe-js";
import OrderProcessing from "../../../reusable/loading/OrderProcessing";
const CreditCard = ({
  error,
  handleSubmit,
  style,
  handleChange,
  processing,
  stripe,
}) => {
  const creditCards = [
    { title: "visa", element: <FaCcVisa /> },
    { title: "mastercard", element: <FaCcMastercard /> },
    { title: "american express", element: <FaCcAmex /> },
    { title: "discover", element: <FaCcDiscover /> },
    { title: "diners club", element: <FaCcDinersClub /> },
  ];
  return (
    <div>
      <div className={style.credit_cards}>
        {creditCards.map((card, i) => {
          return <CreditCards card={card} style={style} key={i} />;
        })}
      </div>
      <form onSubmit={handleSubmit} className={style.form}>
        {error && (
          <div className="card-error" role="alert">
            <Alert status={"danger"} msg={error} />
          </div>
        )}
        <fieldset className={error && style.field_error}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
                border: "1px solid #eee",
              },
            }}
            id="card-element"
            onChange={handleChange}
          />
        </fieldset>
      </form>

      {processing ? (
        <OrderProcessing />
      ) : (
        <div className={style.checkout_button}>
          <button type="submit" disabled={!stripe} onClick={handleSubmit}>
            Complete Order
          </button>
        </div>
      )}
    </div>
  );
};

CreditCard.propTypes = {};

export default CreditCard;
