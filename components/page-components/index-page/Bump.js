import React from "react";
import PropTypes from "prop-types";
import SecondaryButton from "../../reusable/buttons/SecondaryButton";
import { addToCart } from "../../actions/shopifystore";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import style from "./UpsellProduct.module.scss";

const Bump = ({
  index,
  product,
  addToCart,
  shopifystore: { checkout, cart },
  continueEvent,
  buttonText,
}) => {
  const [selectedItem, selectItem] = useState({});
  const [selectedVariant, setVariant] = useState(0);

  const [data, setData] = useState({
    itemData: null,
    checkoutId: "",
    variantId: "",
    name: "",
    price: "",
    description: "",
    image: "",
    itemId: "",
    sku: "",
  });

  const variantIds = product.variants.map((variant) => variant.id);
  const onChange = (e) => {
    // selectItem(e.target.value);
    setVariant(variantIds.indexOf(e.target.value));
  };
  const checkCart = (item) => {
    const value =
      cart.filter((cartItem) => cartItem.variant.id === item.variantId).length >
      0;

    return value;
  };

  const handleAddToCart = async (productData) => {
    // console.log("selectesdfsDFSDFasfsd", productData);

    if (productData !== null) {
      const isInCart = checkCart(productData);

      //if item is already added, dont re add it!
      if (!isInCart) addToCart(productData);

      window?.dataLayer.push({ event: 'upsell', item: productData?.name })

      console.log('added to cart in upsell', window?.dataLayer)
    }
    if (productData === null) window?.dataLayer.push({ event: 'upsellSkipped' })
    continueEvent();
  };

  useEffect(() => {
    if (selectedVariant) {
      console.log("get this product bebe", product.variants[selectedVariant]);
      selectItem(product.variants[selectedVariant]);
    }
  }, [selectedVariant]);

  useEffect(() => {
    if (selectedItem) {
      setData(() => ({
        itemData: product,
        checkoutId: checkout.id,
        variantId: product.variants[selectedVariant].id,
        name: product.title,
        price: product.variants[selectedVariant].price,
        description: product.description,
        image: product.images.length > 0 ? product.images[0].src : "",
        sku: product.variants[selectedVariant].sku,
        itemId: product.id,
      }));
    }
  }, [selectedItem]);

  return (
    <div key={index} className={style.bump}>
      <div
        className={style.shopify_content}
        dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
      ></div>

      {product.options.filter(
        (option) => option.name.toLowerCase() === "ring size"
      ).length > 0 && (
          <div className={style.select_type}>
            <select onChange={(e) => onChange(e)}>
              {product.variants.map((variant, i) => {
                return (
                  <option key={i} value={variant.id}>
                    {
                      variant.selectedOptions.filter(
                        (sel) =>
                          sel.name.toLowerCase() === "size" ||
                          sel.name.toLowerCase() === "ring size"
                      )[0].value
                    }
                  </option>
                );
              })}
            </select>
          </div>
        )}
      <SecondaryButton
        text={buttonText.length >= index ? buttonText[index] : "Add to Order"}
        callback={handleAddToCart}
        callbackValue={data}
      />

      <button
        onPointerDown={(e) => handleAddToCart(null)}
        className={style.decline_btn}
      >
        Continue to Checkout
      </button>
    </div>
  );
};

Bump.propTypes = {};
const mapStateToProps = (state) => ({
  productSelect: state.productSelect,
  shopifystore: state.shopifystore,
});

export default connect(mapStateToProps, { addToCart })(Bump);
