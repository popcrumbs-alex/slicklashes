import React, { createRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import LoadingSpinner from "../loading/LoadingSpinner";
import style from "./Additions.module.scss";
import ProductCard from "./ProductCard";
import SecondaryButton from "../../reusable/buttons/SecondaryButton";
import Image from "next/image";
import {
  finishAddOnSelection,
  selectProduct,
} from "../../actions/productSelect";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Additions = ({
  shopifystore: { inventory, loading, cart, foundItem },
  productSelect: { selectedProduct, addonsSelected },
  finishAddOnSelection,
  selectProduct,
}) => {
  const contentRef = createRef();
  const scrollRef = createRef();
  let animRef = createRef();
  const [additions, filterAdditions] = useState([]);
  const [maxChoice, setMaximum] = useState(5);
  const [selectedNum, addNum] = useState(0);
  const [continueState, setContinueState] = useState(false);
  const [isScrolling, setScrolling] = useState(false);
  const [processing, setProcessing] = useState(true);
  const [count, setItemCountPerColumn] = useState(0);

  const handleProductFiltering = (items) => {
    const filtered = items.filter((item) => {
      return (
        item.options.filter((option) => option.name === "isAddition").length > 0
      );
    });
    filterAdditions(filtered);
  };

  //This function sets the max amount of product to be selected per cart item pre-selected
  //Is that too obvious?
  const handleMaxProductSelectionPerItem = (products) => {
    const itemHasAdditions = products.filter((product) => {
      return (
        product.variant.selectedOptions.filter(
          (opt) => opt.name === "hasAdditions"
        ).length > 0
      );
    });
    // there should only be one item from the cart
    if (itemHasAdditions.length > 0) {
      const additions = itemHasAdditions[0].variant.selectedOptions.filter(
        (opt) => opt.name === "hasAdditions"
      );

      const max = additions[0] ? additions[0].value : 0;

      const parsed = parseFloat(max);

      setMaximum(parsed);

      setProcessing(false);
    } else {
      console.log("skipped!");
      finishAddOnSelection(true);
      setProcessing(false);
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      console.log("scrollin", scrollRef.current.scrollLeft);
      scrollRef.current.scrollLeft = scrollRef.current.scrollLeft += 10;
    }
    animRef.current = requestAnimationFrame(handleScrollRight);
  };

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollLeft -= 10;
    }
    animRef.current = requestAnimationFrame(handleScrollLeft);
  };

  const handleScrollingEvent = (evt) => {
    let location = evt.target.scrollTop;
    return location > 350 ? setScrolling(true) : setScrolling(false);
  };

  const handleStopScrolling = () => cancelAnimationFrame(animRef.current);

  useEffect(() => {
    if (inventory.length > 0 && !loading) handleProductFiltering(inventory);
  }, [inventory, loading]);

  useEffect(() => {
    if (cart.length > 0) handleMaxProductSelectionPerItem(cart);
  }, [cart]);

  useEffect(() => {
    if (selectedNum >= maxChoice) {
      setContinueState(true);
    } else setContinueState(false);
  }, [selectedNum]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.addEventListener("scroll", (e) =>
        handleScrollingEvent(e)
      );
    }
  }, [contentRef]);

  //reset everything when cart is emptied
  useEffect(() => {
    if (cart.length === 0) {
      setContinueState(false);
      addNum(0);
      selectProduct(null);
      finishAddOnSelection(false);
    }
  }, [cart]);

  useEffect(() => {
    if (!loading && additions.length > 0) {
      const itemCount = Math.ceil(additions.length / 2);
      setItemCountPerColumn(itemCount);
    }
  }, [loading, additions]);

  if (!selectedProduct || addonsSelected) {
    return <div></div>;
  }

  if (loading || additions.length === 0 || !foundItem || processing) {
    return (
      <div className={style.popup_container}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={style.popup_container}>
      <div className={style.separator}>
        <div className={style.separator_content}>
          <p>Hold Arrows to Scroll</p>
        </div>
      </div>
      <div className={style.content} ref={contentRef}>
        <div className={style.heading}>
          <h1>Here's what's included in your order:</h1>
          <div className={style.imgs}>
            {foundItem.images.map((img, i) => {
              return (
                <div className={style.img_container} key={i}>
                  <Image
                    src={img.src}
                    alt={img.src}
                    width={260}
                    height={260}
                    quality="60"
                    blurDataURL="https://ik.imagekit.io/usam13ogl7u/slick-logo_ND2boiQBh.png"
                    placeholder="blur"
                  />
                </div>
              );
            })}
          </div>
          <div className={isScrolling ? style.sticky_text_box : style.text_box}>
            <div className={style.inner}>
              <p>Please select {maxChoice.toString()} lashes to continue</p>
              <p>
                <strong>Lashes Selected</strong>:{" "}
                <span style={{ color: continueState ? "green" : "red" }}>
                  {selectedNum}/{maxChoice}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className={style.scrollable_container}>
          <div
            className={style.scroll_container}
            onPointerDown={(e) => handleScrollLeft()}
            onPointerUp={(e) => handleStopScrolling()}
          >
            <FaChevronLeft />
          </div>
          <div className={style.page_container} ref={scrollRef}>
            <div
              className={style.product_grid}
              style={{ gridTemplateColumns: `repeat(${count}, 300px)` }}
            >
              {additions.map((addition, i) => {
                return (
                  <ProductCard
                    key={i}
                    addition={addition}
                    addNum={addNum}
                    selectedNum={selectedNum}
                    maxChoice={maxChoice}
                  />
                );
              })}
            </div>
          </div>
          <div
            className={style.scroll_container}
            onPointerDown={(e) => handleScrollRight()}
            onPointerUp={(e) => handleStopScrolling()}
          >
            <FaChevronRight />
          </div>
        </div>
      </div>
      <div className={style.separator}></div>
      {continueState && (
        <div className={style.btn_container}>
          <SecondaryButton
            text={"Continue"}
            callback={finishAddOnSelection}
            callbackValue={continueState}
          />{" "}
        </div>
      )}
    </div>
  );
};

Additions.propTypes = {
  shopifystore: PropTypes.object,
  productSelect: PropTypes.object,
};

const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
  productSelect: state.productSelect,
});

export default connect(mapStateToProps, {
  finishAddOnSelection,
  selectProduct,
})(Additions);
