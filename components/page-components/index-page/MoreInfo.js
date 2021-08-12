import React from "react";
import { connect } from "react-redux";
import style from "./MoreInfo.module.scss";
import LoadingSpinner from "../loading/LoadingSpinner";
import PrimaryButton from "../../reusable/buttons/PrimaryButton";
import Carousel from "./Carousel";
import { CheckCircle } from "react-feather";

//Relatively clean component
const MoreInfo = ({
  shopifystore: { foundItem, loading },
  productSelect: { sectionRef, sectionLoading },
}) => {
  //Scroll to order selection section
  const handleScrollToSection = () => {
    if (!sectionLoading && sectionRef) {
      sectionRef.scrollIntoView();
    }
  };

  if (loading) {
    return (
      <section className={style.section}>
        <LoadingSpinner />
      </section>
    );
  }
  return (
    <section className={style.section}>
      <div className={style.inner}>
        <div className={style.heading}>
          <h1>
            Premium Mink Lashes, Custom Crafted with Revolutionary 5 Magnet
            System
          </h1>
        </div>
        <div className={style.grid}>
          <div className={style.container_col}>
            <div className={style.col}>
              <Carousel foundItem={foundItem} />
            </div>
          </div>
          <div className={style.container_col}>
            <div className={style.col}>
              <div className={style.sub_heading}>
                <h3>
                  <em>
                    The Slick Lash Kit Comes Complete with Everything You Need.
                    Magnetic Liner, Lash, Compact/Storage, Magnetic Tweezers.
                  </em>
                </h3>
              </div>
            </div>
            <div className={style.col}>
              <div className={style.sell_point_row}>
                <CheckCircle />{" "}
                <p>
                  <strong>Easy to Use</strong> – The Slick lash system makes it
                  easy to apply our lashes. Simply shake the included liner,
                  then draw a line or make dots along your eyelid and connect
                  them, then wait for it to dry. Reapply another line on top,
                  then when line is 90% dry you apply the lash, once lash is on
                  allow for it to fully dry in place for superior hold all
                  day/night.
                </p>
              </div>
              <div className={style.sell_point_row}>
                <CheckCircle />{" "}
                <p>
                  <strong>Vegan and Cruelty Free </strong> – The mink used in
                  our high-quality lashes is harvested when it sheds from the
                  mink and is never pulled from the animal’s skin.
                </p>
              </div>
              <div className={style.sell_point_row}>
                <CheckCircle />{" "}
                <p>
                  <strong>Fast Shipping</strong> - All orders ship within 24
                  hours from our Texas based warehouse and arrives via the USPS
                </p>
              </div>
              <div className={style.sell_point_row}>
                <CheckCircle />{" "}
                <p>
                  <strong>Easily Removed </strong>– When you are ready to take
                  off your lashes for the night (they can be reapplied for up to
                  20 uses) just remove them with the tweezer, store them in the
                  case, and use a q-tip and water to wash away the liner.
                </p>
              </div>
              <PrimaryButton
                callback={handleScrollToSection}
                callbackValue={""}
                text={"Get Your Lash Kit NOW"}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
  productSelect: state.productSelect,
});

export default connect(mapStateToProps, null)(MoreInfo);
