import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import style from "./ReviewForm.module.scss";
import { connect } from "react-redux";
import { createReview } from "../../actions/reviews";
import Input from "../../reusable/forms/input-elements/Input";
import { Star } from "react-feather";
import { Loader } from "../../reusable/loading/Loader";
import { Alert } from "../../reusable/alerts/Alert";

const ReviewForm = ({
  createReview,
  reviews: { reviewData, error, user },
  alert: { alerts },
}) => {
  const [starRating, setRating] = useState(4);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (reviewData || error !== null || alerts.length > 0) setProcessing(false);
  }, [reviewData, error, alerts]);

  const [formData, setFormData] = useState({
    email: user ? user.email : "",
    name: user ? user.name : "",
    review: "",
    rating: "",
  });

  const { email, name, review } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = (e) => {
    e.preventDefault();
    setProcessing(true);
    createReview(formData);
  };

  const handleHover = (index) => {
    console.log(index);
    setRating(index);
  };

  useEffect(() => {
    setFormData({ email, name, review, rating: starRating + 1 });
  }, [starRating]);

  console.log(alerts, error, processing);
  return (
    <div className={style.container}>
      {alerts.length > 0 && error
        ? alerts
            .map((alert, i) => <Alert status={alert.type} msg={alert.msg} />)
            .slice(0, 1)
        : null}
      <form onSubmit={(e) => onSubmit(e)}>
        <h2>Hey {name}, tell us what you think of our product!</h2>
        <div className={style.input_col}>
          <label>Rating*</label>
          <div className={style.star_container}>
            {Array.from([1, 2, 3, 4, 5]).map((star, i) => {
              return (
                <Star
                  key={i}
                  onPointerEnter={(e) => handleHover(i)}
                  className={starRating >= i ? style.filled : style.empty}
                  onClick={(e) => setRating(i)}
                />
              );
            })}
          </div>
        </div>
        <div className={style.input_col}>
          <label>Review*</label>
          <textarea
            name="review"
            value={review}
            onChange={(e) => onChange(e)}
            required={true}
            placeholder="Please write your review here"
          />
        </div>
        {processing ? <Loader /> : <button>Post Review</button>}
      </form>
    </div>
  );
};

ReviewForm.propTypes = {};

const mapStateToProps = (state) => ({
  reviews: state.reviews,
  alert: state.alert,
});

export default connect(mapStateToProps, { createReview })(ReviewForm);
