import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { fetchCheckout, updateCheckout } from "../../actions/shopifystore";
import { connect } from "react-redux";
import { Loader } from "../../reusable/loading/Loader";
import style from "./CheckoutComponent.module.scss";
import ShoppingBagDisplay from "./ShoppingBagDisplay";
import ShippingAddress from "./ShippingAddress";
import CheckoutForm from "./CheckoutForm";
import { Elements } from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import { createTracking } from "../../actions/analytics";
import { stripePromise } from "../../../utils/api";
import { useHookWithRefCallback } from "../../reusable/hooks/useHookWithRefCallback";

const CheckoutComponent = ({
  fetchCheckout,
  shopifystore: {
    checkout,
    loading,
    cart,
    shippingCost,
    shippingUpdated,
    addingToCart,
  },
  updateCheckout,
  createTracking,
  productSelect: { selectedProduct, upsellAddedOrDeclined },
  payments: { paymentSucceeded },
  paypalpayments: { paypalPaymentSucceeded },
}) => {
  const [checkoutId, setId] = useState("");
  const [sectionRef] = useHookWithRefCallback();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== undefined) {
      setId(() => localStorage.getItem("checkout"));
      if (localStorage.getItem("order")) {
        localStorage.removeItem("order");
      }
    }
  }, []);

  useEffect(() => {
    if (checkoutId) fetchCheckout(checkoutId);
  }, [checkoutId]);

  useEffect(() => {
    if ((!loading && cart.length === 0) || !localStorage.getItem("checkout")) {
      router.push("/");
    }
  }, [cart.length]);

  useEffect(() => {
    createTracking({
      checkPoint: "Checkout Page View",
      userID: localStorage.getItem("x20"),
    });
  }, []);

  useEffect(() => {
    //handle shipping value, if over $50(5000) add free shipping
    //If subtotal value is less add shipping cost variable
    console.log("updates?SDFSDFSDFasdf");
    if (checkout && checkout.lineItemsSubtotalPrice && checkoutId) {
      updateCheckout({
        email: localStorage.getItem("email"),
        name: localStorage.getItem("name"),
        shippingPrice: shippingCost.toString(),
        checkoutId: checkoutId,
      });
    }
  }, [checkoutId, cart]);

  //if stripe or paypal payment succeeds, proceed to thankyou page
  useEffect(() => {
    if (paymentSucceeded || paypalPaymentSucceeded) {
      router.push("/thankyou");
    }
  }, [paymentSucceeded, paypalPaymentSucceeded]);

  if (!selectedProduct || !upsellAddedOrDeclined || cart.length === 0) {
    return <section></section>;
  }

  if (addingToCart || loading || checkout === null) {
    return (
      <section className={style.section}>
        <div className={style.inner}>
          <Loader />
        </div>
      </section>
    );
  }

  return (
    <section className={style.section}>
      <div className={style.heading}>
        <h1>Complete Your Order</h1>
      </div>

      <div className={style.inner} ref={sectionRef}>
        <div className={style.col}>
          <ShippingAddress />
          <Elements stripe={stripePromise}>
            {shippingUpdated ? <CheckoutForm /> : null}
          </Elements>
        </div>
        <div className={style.col}>
          <ShoppingBagDisplay />
        </div>
      </div>
    </section>
  );
};

CheckoutComponent.propTypes = {
  fetchCheckout: PropTypes.func,
};

const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
  orders: state.orders,
  productSelect: state.productSelect,
  payments: state.payments,
  paypalpayments: state.paypalpayments,
});

export default connect(mapStateToProps, {
  fetchCheckout,
  updateCheckout,
  createTracking,
})(CheckoutComponent);
