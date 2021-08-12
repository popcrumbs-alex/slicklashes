import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import style from "./Reviews.module.scss";
import { Loader } from "../../reusable/loading/Loader";
import { Star } from "react-feather";
import { createRef } from "react";
import { useState } from "react";
import { useEffect } from "react";

const Reviews = ({ shopifystore: { foundItemName, loading } }) => {
  const scrollRef = createRef();

  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollAmt, setScrollAmt] = useState(0);

  const reviews = [
    {
      starNum: 5,
      reviewer: "Tiffany B. about Duchess Lash Set",
      heading: "I love love love love love my lashes",
      review: `I'm a person that has very short lashes and to be able to put lashes on to go to work and everyday is so amazing is the easiest application ever I love love love love love my lashes`,
      alignRight: false,
    },

    {
      starNum: 5,
      reviewer: "Mia D. about Snatched Lash",
      heading: "Easy to apply and remove",
      review: `Truthfully I was like what did I order these are way too long but I tried them on and was very impressed. I get compliments every day and I love them. Easy to apply and remove.`,
      alignRight: true,
    },
    {
      starNum: 5,
      reviewer: "Gianna L. about Goldiluxx Lash Set",
      heading: "Took all of 6 minutes to put on",
      review: `These were the easiest lashes I have ever tried to put on myself.  Took all of 6 minutes to put on, just threw away all the glue on ones I had and bought a bunch more from here.`,
      alignRight: false,
    },
  ];

  const handleScrolling = (e) => {
    if (!scrollRef.current) return;
    const element = scrollRef.current;
    const progress = scrollRef.current.scrollLeft;
    const totalWidth = element.scrollWidth - element.clientWidth;
    // console.log(scrollRef.current.scrollWidth - scrollRef.current.clientWidth);
    const moved = Math.floor((progress / totalWidth) * 100);

    if (Math.floor(progress) <= 0) {
      setScrollAmt(0);
      return false;
    }
    if (progress > totalWidth) {
      setScrollAmt(100);
      return false;
    }
    setScrollAmt(moved);
  };

  useEffect(() => {
    if (scrollAmt) {
      const index = Math.floor((scrollAmt * reviews.length) / 100);
      setActiveIndex(index);
    }
  }, [scrollAmt]);

  return !loading ? (
    <section className={style.section}>
      <div className={style.inner}>
        <div className={style.heading}>
          <h2>See what others say about our {foundItemName} </h2>
        </div>

        <div
          className={style.reviews_container}
          onScroll={(e) => handleScrolling(e)}
          ref={scrollRef}
        >
          <div className={style.reviews}>
            {reviews.map((review, id) => {
              const starArray = [];
              starArray.length = review.starNum;
              starArray.fill();
              return (
                <div
                  className={`${style.review} ${review.alignRight ? style.align_right : ""
                    }`}
                  key={id}
                >
                  <div className={style.review_col}>
                    <div className={style.icons}>
                      {starArray.map((star, i) => (
                        <Star key={i} />
                      ))}
                    </div>
                    <div className={style.reviewer_name}>
                      <p>{review.reviewer}</p>
                    </div>
                  </div>
                  <div className={style.review_col}>
                    <h4>"{review.heading}"</h4>
                    <p className={style.review_text}>{review.review}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={style.indexes}>
          {reviews.map((r, i) => {
            return (
              <span
                key={i}
                className={i === activeIndex ? style.active_index : ""}
              ></span>
            );
          })}
        </div>
      </div>
    </section>
  ) : (
    <Loader />
  );
};

Reviews.propTypes = { shopifystore: PropTypes.object };

const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
  reviews: state.reviews,
});

export default connect(mapStateToProps, null)(Reviews);
