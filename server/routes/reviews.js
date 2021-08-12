const express = require("express");
const Review = require("../models/Review");
const Customer = require("../models/Customer");
const gravatar = require("gravatar");
const { check, validationResult } = require("express-validator");

const router = express.Router();

const Shopify = require("shopify-api-node");
const moment = require("moment");
const shopify = new Shopify({
  shopName: "pc-reusable-store.myshopify.com",
  apiKey: "1af05ef8df9089c42e38083575f71d5f",
  password: "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",
});

//@route POST route
//@desc create review
//@access public
router.post(
  "/create",
  [
    check("email", "Please enter your email").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("name", "Please enter your name").not().isEmpty(),
    check("review", "Please leave us your thoughts").not().isEmpty(),
    check(
      "review",
      "Please leave at least 10 characters in your review"
    ).isLength({ min: 10 }),
    check("rating", "Please leave a rating").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, review, rating, avatar } = req.body;

    const foundReview = await Review.find({ email });

    console.log(foundReview);

    if (foundReview.length > 0) {
      return res
        .status(400)
        .json({ msg: "You can only post one review per email" });
    }

    const defaultAvatar = gravatar.url(
      email,
      { s: "100", r: "x", d: "retro" },
      true
    );

    const date = moment().format("MMMM Do YY");

    const newReview = new Review({
      email,
      name,
      review,
      rating,
      avatar: defaultAvatar,
      date,
    });

    if (avatar) newReview.avatar = avatar;

    try {
      await newReview.save();

      res.json(newReview);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);
//@route POST route
//@desc find if user has made a purchase
//@access private
router.post(
  "/authenticate",
  [
    check("email", "Please enter your email").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
  ],
  async (req, res) => {
    const { email } = req.body;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const orders = await shopify.order.list();
    const foundUser = orders.filter((order) => {
      return order.email === email;
    })[0];

    console.log(foundUser);

    if (!foundUser) {
      return res
        .status(400)
        .json({ msg: "Could not find an order with that email" });
    }

    try {
      if (foundUser) {
        return res.json({
          msg: "Authenticated",
          email,
          name:
            foundUser.customer.first_name + " " + foundUser.customer.last_name,
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);
//@route GET route
//@desc get all reviews
//@access public
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find();
    const rvrseRviews = reviews.reverse();
    res.json(rvrseRviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});
module.exports = router;
