import React, { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import style from "./ProductChoice.module.scss";
import { connect } from "react-redux";
import LoadingSpinner from "../loading/LoadingSpinner";
import SecondaryButton from "../../reusable/buttons/SecondaryButton";
import { Check } from "react-feather";
import { selectProduct, setSectionRef } from "../../actions/productSelect";
import { addToCart } from "../../actions/shopifystore";
import { useInView } from "react-intersection-observer";

const ProductChoice = ({
  shopifystore: { loading, inventory, checkout, cart },
  setSectionRef,
  selectProduct,
  addToCart,
  productSelect: { finishedUpsell },
}) => {
  const [data, setData] = useState([]);

  const [chosenProduct, chooseProduct] = useState(null);
  const [hasBeenSeen, setSeen] = useState(false);
  const { ref, inView, entry } = useInView({
    threshold: 0,
    initialInView: false,
  });
  const [itemToAdd, setItem] = useState({
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

  //auto select middle choice
  const [selectedNum, setSelected] = useState(1);
  const [selectedVariant, setVariant] = useState(0);

  const sectionRef = useRef();

  const handleProductSelect = (selection) => {
    //should be the index of the item
    setSelected(selection);
    chooseProduct(data[selection]);
  };

  //check cart values
  const checkCart = (item) => {
    const value =
      cart.filter((cartItem) => cartItem.variant.id === item.variantId).length >
      0;

    return value;
  };

  const handleAddToCart = (product) => {
    if (product !== null) {
      const isInCart = checkCart(product);

      console.log("product", product);
      //if item is already added, dont re add it!
      if (!isInCart) addToCart(product);
    }
  };
  //once a product is selected allow user to continue to next step
  const continueButton = (index) => {
    if (typeof index === "number") {
      selectProduct(data[index]);
    }

    //add to cart gtm event
    window?.dataLayer.push({ event: 'addToCart', item: data[index]?.title })

    handleAddToCart(itemToAdd);
  };

  //Filter the product select to not have any bump offers
  const filterOutBumps = () => {
    const filtered = inventory
      .filter(
        (product) => !product.options.map((opt) => opt.name).includes("isBump")
      )
      .filter(
        (product) =>
          !product.options.map((opt) => opt.name).includes("isAddition")
      );
    return setData(filtered);
  };

  //set the chosen product by the index of selection within the product selector

  useEffect(() => {
    if (chosenProduct && checkout) {
      setItem(() => ({
        itemData: chosenProduct,
        checkoutId: checkout.id,
        variantId: chosenProduct.variants[selectedVariant].id,
        name: chosenProduct.title,
        price: chosenProduct.variants[selectedVariant].price,
        description: chosenProduct.description,
        image:
          chosenProduct.images.length > 0 ? chosenProduct.images[0].src : "",
        sku: chosenProduct.variants[selectedVariant].sku,
        itemId: chosenProduct.id,
      }));
    }
  }, [chosenProduct, checkout]);

  //ignore BUMP/OTO type products
  useEffect(() => {
    if (!loading && inventory) {
      filterOutBumps();
    }
  }, [loading, inventory]);

  //set this section's ref to redux state in order to scroll to it
  useEffect(() => {
    if (sectionRef.current) {
      setSectionRef(sectionRef.current);
    }
  }, [sectionRef]);

  //set initial product selected
  useEffect(() => {
    chooseProduct(data[selectedNum]);
  }, [data]);

  //configure visibility of sticky button
  //The section must have been seen once in order to trigger
  useEffect(() => {
    if (inView) {
      setSeen(true);
    }
  }, [inView]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('doth the window layer exist?', window?.dataLayer)
    }
  }, [cart])

  if (loading) {
    return (
      <section className={style.section}>
        <LoadingSpinner />
      </section>
    );
  }

  //DISABLED VIEW
  if (finishedUpsell && cart.length > 0) {
    return (
      <section className={style.section} ref={sectionRef}>
        <div className={style.content}>
          <h1>
            See if magnetic lashes are right for you, Options start at only $14
            + Free Shipping
          </h1>

          <div className={style.product_selector}>
            <div className={style.order_selection_container}>
              <div className={style.contents}>
                <div className={style.animated_discount_sign}>
                  <div className={style.animated_bounds}></div>
                  <h3>
                    74% <br /> Off
                  </h3>
                </div>
                <div className={style.discount_text}>
                  <h2>Your 74% Discount Has Been Applied</h2>
                  <p>
                    <strong>FREE SHIPPING </strong>for orders with{" "}
                    <strong>larger bundles!</strong>
                  </p>
                </div>
              </div>
            </div>
            <div className={style.selection_header}>
              <div className={style.contents}>
                <h2>Step 1: Select order quantity </h2>
              </div>
            </div>
            {data.map((product, i) => {
              const bestDeal = product.options
                .map((opt) => opt.name)
                .includes("isBestDeal");

              return (
                <div
                  className={`${style.product} ${bestDeal && style.best_deal} ${selectedNum === i && style.selected
                    }`}
                  key={i}
                >
                  <div className={style.product_contents}>
                    <div className={style.row}>
                      <div
                        className={
                          selectedNum === i
                            ? `${style.check_box} ${style.check_box_selected}`
                            : style.check_box
                        }
                      >
                        {selectedNum === i && <Check />}
                      </div>
                    </div>
                    <div className={style.col}>
                      <div
                        className={style.description}
                        dangerouslySetInnerHTML={{
                          __html: product.descriptionHtml,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  //LIVE VIEW
  return (
    <section className={style.section} ref={sectionRef}>
      <div className={style.content} ref={ref}>
        <h1>
          See if magnetic lashes are right for you, Options start at only $14 +
          Free Shipping
        </h1>

        <div className={style.product_selector}>
          <div className={style.order_selection_container}>
            <div className={style.contents}>
              <div className={style.animated_discount_sign}>
                <div className={style.animated_bounds}></div>
                <h3>
                  74% <br /> Off
                </h3>
              </div>
              <div className={style.discount_text}>
                <h2>Your 74 % Discount Has Been Applied</h2>
                <p>
                  <strong>FREE SHIPPING </strong>for orders with{" "}
                  <strong>larger bundles!</strong>
                </p>
              </div>
            </div>
          </div>
          <div className={style.selection_header}>
            <div className={style.contents}>
              <h2>Step 1: Select order quantity </h2>
            </div>
          </div>
          {data.map((product, i) => {
            const bestDeal = product.options
              .map((opt) => opt.name)
              .includes("isBestDeal");

            return (
              <div
                className={`${style.product} ${bestDeal && style.best_deal} ${selectedNum === i && style.selected
                  }`}
                key={i}
              >
                <div
                  className={style.product_contents}
                  onPointerUp={() => handleProductSelect(i)}
                >
                  <div className={style.row}>
                    <div
                      className={
                        selectedNum === i
                          ? `${style.check_box} ${style.check_box_selected}`
                          : style.check_box
                      }
                    >
                      {selectedNum === i && <Check />}
                    </div>
                  </div>
                  <div className={style.col}>
                    <div
                      className={style.description}
                      dangerouslySetInnerHTML={{
                        __html: product.descriptionHtml,
                      }}
                    ></div>
                  </div>
                  <SecondaryButton
                    text={selectedNum === i ? "Selected" : "Select"}
                    callback={handleProductSelect}
                    callbackValue={i}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div
          className={
            !inView && hasBeenSeen
              ? style.sticky_button_container
              : style.button_container
          }
        >
          <SecondaryButton
            text={"Continue"}
            callback={continueButton}
            callbackValue={selectedNum}
          />
        </div>
      </div>
    </section>
  );
};

ProductChoice.propTypes = {
  setSectionRef: PropTypes.func,
  selectProduct: PropTypes.func,
  addToCart: PropTypes.any,
};

const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
  productSelect: state.productSelect,
});

export default connect(mapStateToProps, {
  setSectionRef,
  selectProduct,
  addToCart,
})(ProductChoice);
