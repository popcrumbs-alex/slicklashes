import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import style from "./ShoppingBagDisplay.module.scss";
import CartItem from "./CartItem";
import {
  bulkRemoveFromCart,
  removeFromCart,
  retrieveShippingCost,
  setShippingCost,
  setSubtotalForPixel,
} from "../../actions/shopifystore";
import { connect } from "react-redux";
import { Loader } from "../../reusable/loading/Loader";
import { openPopup } from "../../actions/popup";
import { ShoppingBag } from "react-feather";
import { grabOrderTotal } from "../../actions/paypalpayments";
import useFreeItems from "../../reusable/hooks/useFreeItems";

const ShoppingBagDisplay = ({
  removeFromCart,
  shopifystore: { cart, loading, checkout, foundItemName, shippingCost },
  paypalpayments: { orderTotal },
  setSubtotalForPixel,
  bulkRemoveFromCart,
  grabOrderTotal,
  retrieveShippingCost,
  setShippingCost,
}) => {
  const [isOnlyAdditions, checkForAdditions] = useState(false);
  const [pixelTotal, setTotal] = useState(0);
  const containsFreeItem = useFreeItems(cart, "customAttributes", "isFreeItem");

  //parse cart subtotal to pass to pixel on thank you page
  const handleCartTotalForPixel = (freeItem) => {
    return freeItem
      ? setTotal(
          parseFloat(checkout.subtotalPrice) + parseFloat(shippingCost) / 100
        )
      : setTotal(parseFloat(checkout.subtotalPrice).toFixed(2));
  };

  useEffect(() => {
    grabOrderTotal({ checkoutID: checkout.id, cart });
  }, [checkout, cart]);

  useEffect(() => {
    if (checkout) {
      handleCartTotalForPixel(containsFreeItem);
    }
  }, [checkout, cart, containsFreeItem]);
  //This sets the subtotal in storage for the everflow pixel on the confirmation page
  //Need to have a preloaded state amt in order for pixel to trigger
  useEffect(() => {
    if (pixelTotal && checkout) {
      setSubtotalForPixel(pixelTotal);
    }
  }, [checkout, pixelTotal]);

  //NEED TO CHECK IF USER REMOVES MAIN ITEM
  //IF MAIN ITEM GETS REMOVED, MAKE SURE ADDITIONS ARE REMOVED
  //DUE TO THEM BEING 0
  const checkIfCartIsOnlyAdditions = (cart) => {
    const onlyAdditions = cart.every(
      (item) =>
        item.variant.selectedOptions.filter((opt) => opt.name === "isAddition")
          .length > 0
    );
    checkForAdditions(onlyAdditions);
  };

  useEffect(() => {
    checkIfCartIsOnlyAdditions(cart);
  }, [cart]);

  useEffect(() => {
    if (isOnlyAdditions) {
      const itemsToRemove = cart.map((item) => item.id);
      bulkRemoveFromCart({ checkoutId: checkout.id, itemIds: itemsToRemove });
    }
  }, [isOnlyAdditions]);

  useEffect(() => {
    retrieveShippingCost();
  }, [cart]);

  useEffect(() => {
    if (containsFreeItem) {
      //add shipping cost for everlflow
      //Pass a string and parse it against the cart subtotal
      setShippingCost("9.95");
    }
  }, [containsFreeItem]);

  if (loading || !checkout) {
    return <Loader />;
  }
  console.log(
    "values:",
    checkout.subtotalPrice,
    shippingCost,
    containsFreeItem
  );
  console.log(
    "outcome:",
    parseFloat(checkout.subtotalPrice) + parseFloat(shippingCost) / 100
  );

  console.log("pixel total", pixelTotal);

  return (
    <div className={style.bag_display}>
      <div className={style.container}>
        <div className={style.heading}>
          <div className={style.inner}>
            <div className={style.group}>
              <ShoppingBag />
              <h2>Shopping Bag</h2>
            </div>
            <p>Item Count: {cart.length} </p>
          </div>
        </div>
        <div className={style.total_display}>
          <div className={style.row}>
            <h3>
              Subtotal:{" "}
              <span>${parseFloat(checkout.subtotalPrice).toFixed(2)}</span>
            </h3>
          </div>

          <div className={style.row}>
            <p>Tax: ${checkout.totalTax}</p>
          </div>
          <div className={style.row}>
            <p>
              Shipping:{` `}
              {containsFreeItem
                ? "$" + (shippingCost / 100).toFixed(2)
                : "FREE"}
            </p>
          </div>
          <div className={style.row}>
            <h2>
              TOTAL: <span>${(orderTotal / 100).toFixed(2)}</span>
            </h2>
          </div>
        </div>
        {!loading ? (
          <div className={style.items_container}>
            <div className={style.items}>
              {cart.map((item, i) => {
                return (
                  <CartItem
                    item={item}
                    removeFromCart={removeFromCart}
                    checkout={checkout}
                    foundItemName={foundItemName}
                    removeFromCart={removeFromCart}
                    style={style}
                    isOnlyAdditions={isOnlyAdditions}
                    cart={cart}
                    i={i}
                    key={i}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <Loader />
        )}
      </div>
    </div>
  );
};

ShoppingBagDisplay.propTypes = {
  shopifystore: PropTypes.object,
};

const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
  popup: state.popup,
  paypalpayments: state.paypalpayments,
});

export default connect(mapStateToProps, {
  removeFromCart,
  openPopup,
  setSubtotalForPixel,
  bulkRemoveFromCart,
  grabOrderTotal,
  retrieveShippingCost,
  setShippingCost,
})(ShoppingBagDisplay);
