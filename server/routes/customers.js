const express = require("express");
const auth = require("../middleware/auth");
const Customer = require("../models/Customer");
const router = express.Router();
const moment = require("moment");
const { findById } = require("../models/Customer");
//@route GET route
//@desc get customer purchase total
//@access private
router.get("/purchases", auth, async (req, res) => {
  const foundCustomers = await Customer.find();

  let filterByPurchase = foundCustomers
    .map((cust) => {
      return cust.orders.filter((order) => order.paymentStatus === "paid");
    })
    .filter((obj) => obj.length > 0);

  if (filterByPurchase.length === 0) {
    return res
      .status(400)
      .json({ msg: `That's weird, could not filter purchases.` });
  }
  try {
    res.json(filterByPurchase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route GET route
//@desc get all customers
//@access private
router.get("/emails", auth, async (req, res) => {
  const foundCustomers = await Customer.find();

  const customerEmails = foundCustomers.map((cust) => cust.email);
  try {
    res.json(customerEmails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route GET route
//@desc get specific customer object
//@access private
router.get("/customer/", async (req, res) => {
  console.log(req.id, req.body);

  const { email } = req.body;

  try {
    const foundCustomer = await Customer.findOne({ email });

    res.json(foundCustomer);
  } catch (error) {
    console.log("finding customer error", error);
    res.status(500).json({ msg: error });
  }
});

//@route GET route
//@desc retrieve customer objects
//@access private
router.get("/allcustomers", auth, async (req, res) => {
  const customers = await Customer.find().select("-orders");

  try {
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route post route
//@desc update customer objects that are missing data
//@access private
//this will reset all signupDates to customer's first order date, incase that information is missing
router.post("/signupdates", auth, async (req, res) => {
  try {
    const foundCustomers = await Customer.find();

    const ids = foundCustomers
      .filter((cus) => cus.orders.length > 0)
      .map((customer) => customer._id);

    const foundCustomerWithId = await Promise.all(
      ids.map(async (id) => {
        try {
          const foundCustomer = await Customer.findById(id);
          foundCustomer.signupDate = foundCustomer.orders[0].orderDate;
          await foundCustomer.save();
          return foundCustomer.signupDate;
        } catch (error) {
          console.error(error);
        }
      })
    );

    res.json(foundCustomerWithId);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});
module.exports = router;
