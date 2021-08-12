import React, { createRef } from "react";
import { ReactDOM } from "react";
import PropTypes from "prop-types";
import braintree from "braintree-web";
// import { PayPalButton } from "react-paypal-button-v2";
import { useState } from "react";
import {
  createPaypalOrder,
  processBraintreeOrder,
  retrieveClientToken,
} from "../../../actions/paypalpayments";
import { connect } from "react-redux";
import { useEffect } from "react";
import OrderProcessing from "../../../reusable/loading/OrderProcessing";
import LoadingSpinner from "../../loading/LoadingSpinner";
import { useEffectOnlyOnce } from "../../../reusable/hooks/useEffectOnlyOnce";

const BraintreeUI = ({
  checkout,
  formattedTotal,
  clientId,
  retrieveClientToken,
  processBraintreeOrder,
  paypalpayments: { clientToken },
}) => {
  const paypal = require("paypal-checkout");

  const [processing, setProcessing] = useState(false);
  const [doesButtonExist, setExistance] = useState(false);
  const [clientReceived, checkIfreceived] = useState(null);
  const { shippingAddress } = checkout;

  const email = window.localStorage.getItem("email");

  const { address1, address2, zip, city, province, firstName, lastName } =
    shippingAddress;

  useEffect(() => {
    //Get the client token needed to initiate braintreeUI from the server
    retrieveClientToken();
  }, []);

  const renderPaypalWithBraintree = async () => {
    if (doesButtonExist) return;
    if (!clientToken) return;
    {

      try {
        const clientInstance = await braintree.client.create({
          authorization: clientToken,
        });

        if (clientInstance) {
          braintree.paypalCheckout.create(
            {
              client: clientInstance,
            },
            function (createErr, paypalCheckoutInstance) {
              if (createErr) {
                console.error("Error!", createErr);
                return;
              }

              paypal.Button.render(
                {
                  env: "production", // or 'sandbox'

                  locale: "en_US",

                  payment: () => {
                    console.log(
                      "paypsl",
                      paypalCheckoutInstance.createPayment,
                      {
                        address_line_1: address1,
                        address_line_2: address2,
                        country_code: "US",
                        postal_code: zip,
                        admin_area_2: city,
                        admin_area_1: province,
                      }
                    );
                    return paypalCheckoutInstance.createPayment({
                      flow: "checkout",
                      currency: "USD",
                      amount: ".50",
                      intent: "capture",
                    });
                  },

                  onAuthorize: function (data, actions) {
                    return paypalCheckoutInstance
                      .tokenizePayment(data)
                      .then(function (payload) {
                        // Submit payload.nonce to your server
                        console.log("noncense!", payload.nonce);
                        processBraintreeOrder({
                          nonce: payload.nonce,
                          checkoutID: checkout.id,
                          shippingAddress: shippingAddress,
                          firstName,
                          lastName,
                          email,
                        });
                      });
                  },

                  onCancel: function (data) {
                    console.log(
                      "checkout.js payment cancelled",
                      JSON.stringify(data, 0, 2)
                    );
                  },

                  onError: function (err) {
                    console.error("checkout.js error", err);
                  },
                },
                "#paypal-button"
              ); // the PayPal button will be rendered in an html element with the id `paypal-button`
            }
          );
          setExistance(true);
          console.log("papspapppd", clientInstance);
        }
      } catch (error) {
        console.error("BRAINTREE_ERROR", error);
      }
    }
  };

  useEffect(() => {
    if (clientToken) {
      renderPaypalWithBraintree();
    }
  }, [clientToken]);

  if (!shippingAddress) {
    return <p>Loading...</p>;
  }

  if (processing) {
    return <OrderProcessing />;
  }

  if (!clientToken || !formattedTotal) {
    return <LoadingSpinner />;
  }

  console.log("formateddddd total", formattedTotal, braintree);

  return (
    <>
      <style>
        {`.braintree-sheet__content--button {
            text-align:left;  
          }
          .paypal-button.paypal-button-color-gold {
            padding:1rem 2rem !important;
          }
      `}
      </style>

      <div>
        <div id="paypal-button" style={{ marginTop: "1rem;" }}></div>
      </div>
    </>
  );
};

BraintreeUI.propTypes = {};

const mapStateToProps = (state) => ({
  paypalpayments: state.paypalpayments,
});

export default connect(mapStateToProps, {
  retrieveClientToken,
  createPaypalOrder,
  processBraintreeOrder,
})(BraintreeUI);
