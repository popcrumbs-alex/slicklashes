const axios = require("axios");
require("es6-promise").polyfill();
require("isomorphic-fetch");
const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();

//@route POST route
//@desc signup for mailing list
//@access public
router.post(
  "/signup",
  [
    check("email", "Please enter your email").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const response = await axios({
        url: `https://a.klaviyo.com/api/v2/list/${process.env.KLAVIYO_LIST_ID}/members`,

        method: "POST",
        params: { api_key: process.env.KLAVIYO_KEY },
        headers: {
          "Content-Type": "application/json",
        },
        data: { profiles: { email } },
      });
      console.log(response.data, email);
      //should we check if user is already signed up
      res.json({ msg: "Successfully Signed Up!" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: error });
    }
  }
);

module.exports = router;
