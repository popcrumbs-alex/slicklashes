import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { fetchReviews } from "../../actions/reviews";
import { connect } from "react-redux";
import ReviewData from "./ReviewData";
import Review from "../index-page/Review";
import style from "./ReviewsComponent.module.scss";

const ReviewsComponent = ({ fetchReviews, reviews: { reviews } }) => {
  useEffect(() => {
    fetchReviews();
  }, []);
  const reviewMap = reviews.map((rev, i) => {
    return (
      <Review
        name={rev.name}
        img={rev.avatar}
        content={rev.review}
        rating={rev.rating}
        key={i}
        date={rev.date}
      />
    );
  });
  return (
    <div className={style.container}>
      <div className={style.inner}>
        <ReviewData />
        <section className={style.section}>{reviewMap}</section>
      </div>
    </div>
  );
};

ReviewsComponent.propTypes = {};

const mapStateToProps = (state) => ({
  reviews: state.reviews,
});

export default connect(mapStateToProps, { fetchReviews })(ReviewsComponent);
