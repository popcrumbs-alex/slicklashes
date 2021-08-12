import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Loader } from "../../reusable/loading/Loader";
import style from "./ConfirmationComponent.module.scss";
import {
  clearPaymentObject,
  setPaymentSucceeded,
} from "../../actions/payments";
import { createTracking } from "../../actions/analytics";
import ErrorPage from "../../reusable/errors/ErrorPage";
import useFreeItems from "../../reusable/hooks/useFreeItems";
import ReactGA from "react-ga";

const ConfirmationComponent = ({
  clearPaymentObject,
  shopifystore: { loading, checkout, shippingCost },
  paypalpayments: { orderTotal },
  createTracking,
}) => {
  const [total, setTotal] = useState(0);
  const containsFreeItem = useFreeItems(
    checkout?.lineItems,
    "customAttributes",
    "isFreeItem"
  );

  useEffect(() => {
    setPaymentSucceeded(false);
    clearPaymentObject();
  }, []);

  useEffect(() => {
    createTracking({
      checkPoint: "Order Confirmed",
      userID: localStorage.getItem("x20"),
    });

    ReactGA.plugin.require("ecommerce", { debug: true });
  }, []);

  useEffect(() => {
    window?.dataLayer.push({ event: "pageView", page: "Thank You" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (orderTotal !== 0) {
      //UOID to tag
      const formatted = (parseFloat(orderTotal) / 100).toFixed(2);
      setTotal(formatted);
    }
  }, [orderTotal]);

  useEffect(() => {
    if (total > 0) {
      window?.dataLayer.push({
        category: "User",
        event: "finishCheckout",
        total,
        orderId: checkout.id,
        label: "checkout",
      });
      console.log("window", window?.dataLayer);
    } else {
      window.dataLayer.push({
        category: "test",
        event: "finishCheckout(Failure): Event did not capture revenue",
        total: 0,
        orderId: "34wffdfsf",
        label: "checkout(failure)",
      });
      console.log("fake event", window.dataLayer);
    }
  }, [total]);

  useEffect(() => {
    //add purchase event to google analytics\
    ReactGA.event(
      {
        category: "slicklashes.com",
        action: "Completed Checkout, Thank You Page",
        value: total,
        label: "finishCheckout:" + total,
      },
      "UserTracker"
    );
    ReactGA.plugin.execute("ecommerce", "addTransaction", {
      affiliation: "slicklashes",
      name: "lashkit",
      id: checkout?.id,
      revenue: total,
    });

    ReactGA.plugin.execute("ecommerce", "send");
  }, [total, checkout]);

  if (loading || !checkout) {
    <section className={style.section}>
      <div className={style.inner}>
        <Loader /> Retrieving Your Order...
      </div>
    </section>;
  }

  if (checkout) {
    return (
      <section className={style.section}>
        <div className={style.inner}>
          <div className={style.container}>
            <h1>Thank you for your order !</h1>
            <p>
              An email receipt and order confirmation will be sent to your email
            </p>
            <p>
              If you see any discrepencies with your order, please contact our
              support at <a href="support@slick.love">support@slick.love</a>
            </p>
          </div>
          <div className={style.order_container}>
            <div className={style.col}>
              <h1>Shipping</h1>
              <ul>
                <li>
                  <span>Name:</span> {checkout.shippingAddress.name}{" "}
                </li>
                <li>
                  <span>Address:</span> {checkout.shippingAddress.address1}
                </li>
                <li>
                  <span>City:</span> {checkout.shippingAddress.city}
                </li>
                <li>
                  <span>State:</span> {checkout.shippingAddress.province}
                </li>
                <li>
                  <span>Zip Code:</span> {checkout.shippingAddress.zip}
                </li>
              </ul>
            </div>
            <div className={style.col}>
              <h1>My Order</h1>
              <ul>
                {checkout.lineItems.map((item, i) => {
                  return (
                    <li className={style.item} key={i}>
                      <h3>
                        {item.title}:{` `}
                        {parseFloat(item.variant.price) === 0
                          ? "FREE"
                          : "$" + item.variant.price}
                      </h3>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className={style.col}>
              <h1>Order Pricing</h1>
              <ul>
                <li>Order Subtotal: ${checkout.subtotalPrice}</li>
                <li>
                  <p>
                    Shipping:
                    {containsFreeItem
                      ? "$" + (shippingCost / 100).toFixed(2)
                      : "FREE"}
                  </p>
                </li>
                <li>
                  <p>Tax: ${checkout.totalTax}</p>
                </li>
                <li>
                  <h2>
                    Order Total: ${(parseFloat(orderTotal) / 100).toFixed(2)}{" "}
                  </h2>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return <ErrorPage redirectRoute={"/"} />;
};

ConfirmationComponent.propTypes = {};

const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
  paypalpayments: state.paypalpayments,
});
export default connect(mapStateToProps, {
  clearPaymentObject,
  createTracking,
})(ConfirmationComponent);
