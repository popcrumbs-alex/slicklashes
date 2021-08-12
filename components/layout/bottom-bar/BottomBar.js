import React from "react";
import PropTypes from "prop-types";
import style from "./BottomBar.module.scss";
import { connect } from "react-redux";
import { openPopup } from "../../actions/popup";
import { createTracking } from "../../actions/analytics";

const BottomBar = ({
  shopifystore: { checkout },
  createTracking,
  productSelect: { selectedProduct, sectionRef },
}) => {
  const handleScrollToCheckout = () => {
    if (sectionRef) {
      sectionRef.scrollIntoView();
    }
  };

  if (!selectedProduct && !checkout) {
    return <></>;
  }

  return (
    selectedProduct && (
      <div className={style.bar}>
        <div className={style.bar_inner}>
          <button
            onClick={(e) => {
              createTracking({
                checkPoint: "Checkout (bottom bar)",
                userID: localStorage.getItem("x20"),
              });
              handleScrollToCheckout();
            }}
          >
            Checkout
          </button>
        </div>
      </div>
    )
  );
};

BottomBar.propTypes = {
  popup: PropTypes.object,
};

const mapStateToProps = (state) => ({
  productSelect: state.productSelect,
  shopifystore: state.shopifystore,
});

export default connect(mapStateToProps, { openPopup, createTracking })(
  BottomBar
);
