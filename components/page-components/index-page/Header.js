import React from "react";
import PropTypes from "prop-types";
import style from "./Header.module.scss";
import { connect } from "react-redux";
import * as Icon from "react-feather";
import ReactPlayer from "react-player/lazy";
import { Loader } from "../../reusable/loading/Loader";
import { createTracking } from "../../actions/analytics";
import PrimaryButton from "../../reusable/buttons/PrimaryButton";

const Header = ({
  shopifystore: { loading, foundItem },
  createTracking,
  productSelect: { sectionRef, sectionLoading },
}) => {
  const data = [
    {
      icon: <Icon.CheckCircle size={30} />,
      text: "Make Your Eyes Stand Out.  Get the Look That Gets The Looks",
    },
    {
      icon: <Icon.CheckCircle size={30} />,
      text: "Easily Apply at Home in Minutes, So Easy to Do!",
    },
    {
      icon: <Icon.CheckCircle size={30} />,
      text: "Safe For All Eyes and Skin Types",
    },
  ];

  //scroll to product selector
  const handleScrollToSection = () => {
    if (!sectionLoading && sectionRef) {
      sectionRef.scrollIntoView();
    }
  };

  return (
    <header className={style.header}>
      <div className={style.container}>
        <div className={style.heading}>
          <h1>Slick Magnetic Lashes Will Light Up Your Face</h1>
          <h3>Try Them for FREE Through This Special Promotion</h3>
        </div>
        {!loading && foundItem ? (
          <div className={style.hero}>
            <div className={style.hero_col}>
              <ReactPlayer
                url="https://popcrumbs-1.wistia.com/medias/pdg7s74p55"
                width={"100%"}
              />
            </div>
            <div className={style.hero_col}>
              {data.map((item, i) => {
                return (
                  <div className={style.sell_point_row} key={i}>
                    {item.icon} <p>{item.text}</p>
                  </div>
                );
              })}
              <PrimaryButton
                callback={handleScrollToSection}
                callbackValue={""}
                analyticsEvent={createTracking}
                checkpoint={"Open Popup"}
                userID={localStorage.getItem("x20")}
                text={"Get Your FREE Lash Kit Now"}
                icon={<Icon.ArrowRight />}
              />
            </div>
          </div>
        ) : (
          <Loader />
        )}
      </div>
    </header>
  );
};

Header.propTypes = {
  shopifystore: PropTypes.object,
};

const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
  productSelect: state.productSelect,
});

export default connect(mapStateToProps, {
  createTracking,
})(Header);
