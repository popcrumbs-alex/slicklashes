import React, { useEffect } from "react";
import PropTypes from "prop-types";
import Nav from "./nav/Nav";
import Footer from "./footer/Footer";
import { connect } from "react-redux";
import { setItem, setItemTitle } from "../actions/shopifystore";
import style from "./Layout.module.scss";

const Layout = ({
  children,
  shopifystore: { foundItem },
  setItemTitle,
  setItem,
}) => {
  //If the item does not have the desired title as it's first level
  //use the variant title

  useEffect(() => {
    if (foundItem) {
      setItem(foundItem);
      //sets the found item name
      setItemTitle(foundItem.title);
    }
  }, [foundItem]);

  return (
    <main className={style.main}>
      <div className={style.inner}>
        <Nav />
        {children}
        <Footer />
      </div>
    </main>
  );
};

Layout.propTypes = {
  shopifystore: PropTypes.object,
};

const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
});

export default connect(mapStateToProps, { setItem, setItemTitle })(Layout);
