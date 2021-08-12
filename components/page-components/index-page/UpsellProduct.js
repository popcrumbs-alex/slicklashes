import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import style from "./UpsellProduct.module.scss";
import LoadingSpinner from "../loading/LoadingSpinner";
import {
  addOrDeclineUpsell,
  finishUpsellStep,
} from "../../actions/productSelect";
import Bump from "./Bump";

const UpsellProduct = ({
  productSelect: { selectedProduct, addonsSelected },
  shopifystore: { inventory, loading },
  addOrDeclineUpsell,
  finishUpsellStep,
}) => {

  const [upsellProducts, setProducts] = useState([]);

  const [activeBumpIndex, setIndex] = useState(0);

  const [buttonContinueText, setButtonText] = useState([
    "Yes I want this in my bag for 40% off",
  ]);

  const continueEvent = () => {
    setIndex((prevIndex) => prevIndex + 1);
  };

  //filter so only bumps are here
  useEffect(() => {
    if (!loading && inventory) {
      const foundUpsellProducts = inventory.filter(
        (product) =>
          product.options.filter((opt) => opt.name === "isBump").length > 0
      );

      if (foundUpsellProducts) setProducts(foundUpsellProducts);
    }
  }, [loading.inventory]);

  //expose the checkout process once offers a re passed thru
  useEffect(() => {
    if (upsellProducts.length > 0 && !loading)
      if (activeBumpIndex > upsellProducts.length - 1) {
        // console.log("bumpo is greated", activeBumpIndex, upsellProducts.length);
        addOrDeclineUpsell(true);
      }
  }, [activeBumpIndex, upsellProducts, loading]);

  useEffect(() => {
    if (upsellProducts.length > 0)
      if (activeBumpIndex > upsellProducts.length - 1) {
        finishUpsellStep(true);
      }
  }, [activeBumpIndex, upsellProducts]);

  useEffect(() => {
    //gtm for checkout process starting
    if (typeof window !== 'undefined') {
      window?.dataLayer.push({ event: 'startCheckout' })
    }
  }, [])

  //selectedProduct is if a product has been selected from the previous step in productChoice
  if (!selectedProduct || !addonsSelected) {
    return <section className={style.section_hidden}></section>;
  }

  if (!upsellProducts) {
    return (
      <section>
        <LoadingSpinner />
      </section>
    );
  }

  //don't render anything after user completes oto process
  if (activeBumpIndex > upsellProducts.length - 1) return null;

  return (
    <section className={style.upsell_section}>
      <div className={style.content}>
        {
          upsellProducts.map((product, i) => {
            return (
              <Bump
                index={i}
                product={product}
                key={i}
                continueEvent={continueEvent}
                buttonText={buttonContinueText}
              />
            );
          })[activeBumpIndex]
        }
      </div>
    </section>
  );
};

UpsellProduct.propTypes = {};

const mapStateToProps = (state) => ({
  productSelect: state.productSelect,
  shopifystore: state.shopifystore,
});

export default connect(mapStateToProps, {
  addOrDeclineUpsell,
  finishUpsellStep,
})(UpsellProduct);
