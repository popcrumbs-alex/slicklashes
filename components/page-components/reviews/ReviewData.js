import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import style from "./ReviewData.module.scss";
import { connect } from "react-redux";
import { fetchReviews, toggleForm, togglePopup } from "../../actions/reviews";
import SignIn from "./SignIn";
import ReviewForm from "./ReviewForm";
import { Alert } from "../../reusable/alerts/Alert";

//TODO figure out how to display ratings, can't do math right now
const ReviewData = ({
  reviews: { reviews, popup, authenticated, reviewData },
  fetchReviews,
  toggleForm,
  togglePopup,
  alert: { alerts },
}) => {
  const [ratings, setRatings] = useState({
    five: [],
    four: [],
    three: [],
    two: [],
    one: [],
  });

  const { five, four, three, two, one } = ratings;

  const loadRatings = () => {
    return reviews.map((review) => {
      console.log(review.rating);
      switch (true) {
        case parseInt(review.rating) === 5:
          return setRatings((prevState) => ({
            ...ratings,
            five: [...five, review.rating],
          }));
        case parseInt(review.rating) === 4:
          return setRatings((prevState) => ({
            ...ratings,
            four: [...four, review.rating],
          }));
        case parseInt(review.rating) === 3:
          return setRatings((prevState) => ({
            ...ratings,
            three: [...three, review.rating],
          }));

        case parseInt(review.rating) === 2:
          return setRatings((prevState) => ({
            ...ratings,
            two: [...two, review.rating],
          }));

        case parseInt(review.rating) === 1:
          return setRatings((prevState) => ({
            ...ratings,
            one: [...one, review.rating],
          }));
        default:
          return;
      }
    });
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    loadRatings();
  }, [reviews]);

  useEffect(() => {
    if (authenticated) togglePopup(false);
  }, [authenticated]);

  return (
    <div className={style.data_container}>
      {popup ? <SignIn /> : null}

      <div className={style.box}>
        <h2>
          {reviews.length} Reviews /{" "}
          {authenticated ? (
            <button onClick={(e) => toggleForm()}>Close X</button>
          ) : (
            <button onClick={(e) => togglePopup(true)}>Write a review</button>
          )}
        </h2>
        {authenticated ? <ReviewForm /> : null}
        {alerts.length > 0 && reviewData !== null
          ? alerts
              .map((alert, i) => <Alert status={alert.type} msg={alert.msg} />)
              .slice(0, 1)
          : null}
      </div>
    </div>
  );
};

ReviewData.propTypes = {};

const mapStateToProps = (state) => ({
  reviews: state.reviews,
  alert: state.alert,
});

export default connect(mapStateToProps, {
  fetchReviews,
  togglePopup,
  toggleForm,
})(ReviewData);
