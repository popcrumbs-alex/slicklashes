const express = require("express");
//need to change this conditionally for environment
const stripe = require("stripe")(
  process.env.NODE_ENV === "development"
    ? process.env.STRIPE_TEST_SECRET
    : process.env.STRIPE_LIVE_SECRET
);
const router = express.Router();
const Customer = require("../models/Customer");
const calculateOrderAmt = require("../reusable/calculateOrderAmt");
const { handleFreeItem } = require("../reusable/handleFreeItem");
const handleSubscriptionItem = require("../reusable/handleSubscriptionItem");

//@route POST route
//@desc create a payment intent via stripe api
//@access private
router.post("/create-payment-intent", async (req, res) => {
  const {
    items,
    checkoutId,
    shippingPrice = "0",
    tax,
    email,
    name,
    shippingAddress,
  } = req.body;

  //shippingPrice gets passed as a whole number not a float
  //tax is float(decimal)
  console.log(`///////////////////////////////////////////
  STRIPE/////////////////////////////////`);
  if (!items) {
    return res.status(400).json({ msg: "No items were found" });
  }

  let customer;
  let freeItem;
  let foundStripeCustomer;
  let amount;
  let paymentIntent;

  const products = items.map((item) => item.title);

  const orderAmount = calculateOrderAmt(items, shippingPrice, tax);

  const containsSubscription = handleSubscriptionItem(items);

  freeItem = handleFreeItem(items);

  console.log(
    "free item in stripe: STRIPEEEEEE",
    freeItem,
    containsSubscription
  );

  try {
    //if there's an existing customer in the database, just update the object
    const foundCustomer = await Customer.findOne({ email });

    if (foundCustomer && foundCustomer.stripeCustomerID) {
      foundStripeCustomer = await stripe.customers.retrieve(
        foundCustomer.stripeCustomerID
      );
    }

    //if there are no existing stripe customers with that ID, create a new one
    if (!foundStripeCustomer) {
      customer = await stripe.customers.create({
        email,
        name,
        description: "New Customer!",
        address: {
          city: shippingAddress.city,
          country: "US",
          line1: shippingAddress.address1,
          line2: shippingAddress.address2,
          postal_code: shippingAddress.zip,
          state: shippingAddress.province,
        },
      });
    }

    if (foundStripeCustomer) {
      customer = await stripe.customers.update(foundCustomer.stripeCustomerID, {
        email,
        name,
        description: "Returning Customer",
        address: {
          city: shippingAddress.city,
          country: "US",
          line1: shippingAddress.address1,
          line2: shippingAddress.address2,
          postal_code: shippingAddress.zip,
          state: shippingAddress.province,
        },
      });
    }

    //configure amount to charge in stripe depending on item types
    //Funnel type will determine if there is a free item
    if (freeItem) {
      amount = calculateOrderAmt(
        items,
        process.env.STRIPE_SHIPPING_COST.toString(),
        tax
      );
    }

    if (!freeItem) amount = calculateOrderAmt(items, shippingPrice, tax);

    if (containsSubscription) {
      //if there is a subscription item we need to charge only 50cents in stripe, which will be automatically refunded
      amount = 50;
      // Do not include a receipt email, this charge will be auto refunded
      paymentIntent = await stripe.paymentIntents.create({
        customer: customer.id,
        setup_future_usage: "off_session",
        amount,
        currency: "usd",
        metadata: {
          shopifyToken: checkoutId,
          order_source: process.env.STRIPE_ORDER_SOURCE,
          email,
          orderAmount: amount,
          greeting: "What is life?",
        },
        description: `THIS CHARGE WILL BE AUTOMATICALLY REFUNDED AND PROCESSED IN RECHARGE BECAUSE IT IS A SUBSCRIPTION.`,
        shipping: {
          address: {
            city: shippingAddress.city,
            country: "US",
            line1: shippingAddress.address1,
            line2: shippingAddress.address2,
            postal_code: shippingAddress.zip,
            state: shippingAddress.province,
          },
          name,
          phone: shippingAddress.phone,
        },
      });
    }

    if (!containsSubscription) {
      paymentIntent = await stripe.paymentIntents.create({
        customer: customer.id,
        setup_future_usage: "off_session",
        amount,
        currency: "usd",
        metadata: {
          shopifyToken: checkoutId,
          order_source: process.env.STRIPE_ORDER_SOURCE,
          email,
          orderAmount,
          greeting: "What is life?",
        },
        description: `${customer.email}, ${
          customer.name
        } Products: ${products.join(", ")}`,
        receipt_email: email,
        shipping: {
          address: {
            city: shippingAddress.city,
            country: "US",
            line1: shippingAddress.address1,
            line2: shippingAddress.address2,
            postal_code: shippingAddress.zip,
            state: shippingAddress.province,
          },
          name,
          phone: shippingAddress.phone,
        },
      });
    }
    console.log("THIS IS A PAYMENT INTENT", paymentIntent);
    //add to customer's order array
    const orderObject = {
      shopifyToken: checkoutId,
      paymentGateway: "stripe",
      paymentId: paymentIntent.id,
      orderTotal: paymentIntent.amount,
      stripeCustomerID: paymentIntent.customer,
      paymentStatus: "pending",
      items: items.map((item) => {
        return { title: item.title, amount: item.variant.price };
      }),
    };

    //create a new customer if one does not exist
    if (!foundCustomer) {
      const newCustomer = {};
      newCustomer.name = name;
      newCustomer.email = email;
      newCustomer.orders = [];
      newCustomer.stripeCustomerID = paymentIntent.customer;
      newCustomer.orders.unshift(orderObject);
      newCustomer.shippingAddress = {
        name: shippingAddress.name,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2,
        province: shippingAddress.province,
        city: shippingAddress.city,
        country: "US",
        zipCode: shippingAddress.zip,
        phone: shippingAddress.phone,
      };

      const createdCustomer = new Customer(newCustomer);

      await createdCustomer.save();

      console.log("new customer", createdCustomer);
    }

    //save to existing customer
    if (foundCustomer) {
      // console.log("found a customerr", foundCustomer);
      foundCustomer.stripeCustomerID = paymentIntent.customer;
      foundCustomer.shippingAddress = {
        name: shippingAddress.name,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2,
        province: shippingAddress.province,
        city: shippingAddress.city,
        country: "US",
        zipCode: shippingAddress.zip,
        phone: shippingAddress.phone,
      };
      foundCustomer.orders.unshift(orderObject);

      await foundCustomer.save();
    }

    // console.log('THIS IS A FOUND CUSTOMER IN THE CREATE INTENT ENDPOINT:', foundCustomer);
    return res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route POST route
//@desc update payment intent
//@access private
router.post("/update-payment-intent", async (req, res) => {
  const {
    paymentIntentId,
    items,
    shippingPrice,
    tax,
    email,
    shippingAddress,
    name,
  } = req.body;

  let freeItem;
  let amount;
  let paymentIntent;
  let foundStripeCustomer;

  const orderAmount = calculateOrderAmt(items, shippingPrice, tax);

  const containsSubscription = handleSubscriptionItem(items);

  console.log("is subscription item in here?", containsSubscription);

  if (orderAmount === 0) freeItem = true;

  console.log(
    "this is the order amount",
    orderAmount,
    calculateOrderAmt(items, process.env.STRIPE_SHIPPING_COST.toString(), tax),
    "free item>?",
    freeItem
  );

  //charge 50 cents for subscription charges, checkout will be processed through ReCharge
  if (containsSubscription) amount = 50;

  try {
    const foundCustomer = await Customer.findOne({ email });

    if (!foundCustomer) {
      return res
        .status(400)
        .json({ msg: "Could not locate an existing customer to update" });
    }

    if (foundCustomer && foundCustomer.stripeCustomerID) {
      foundStripeCustomer = await stripe.customers.retrieve(
        foundCustomer.stripeCustomerID
      );
    }

    if (!foundStripeCustomer) {
      return res.status(400).json({
        msg: "Could not locate a customer with that ID, update failed",
      });
    }

    //update customer in the database
    foundCustomer.shippingAddress = {
      name: shippingAddress.name,
      address1: shippingAddress.address1,
      address2: shippingAddress.address2,
      province: shippingAddress.province,
      city: shippingAddress.city,
      country: "US",
      zipCode: shippingAddress.zip,
      phone: shippingAddress.phone,
    };
    foundCustomer.email = email;
    foundCustomer.name = name;

    await foundCustomer.save();

    await stripe.customers.update(foundCustomer.stripeCustomerID, {
      email,
      name,
      description: "I am a returning customer!",
      address: {
        city: shippingAddress.city,
        country: "US",
        line1: shippingAddress.address1,
        line2: shippingAddress.address2,
        postal_code: shippingAddress.zip,
        state: shippingAddress.province,
      },
    });

    //update stripe intent based upon subscription item
    if (containsSubscription) {
      console.log("updated stripe payment intent for subscription amount");
      paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        amount,
      });
    }
    //handle payment intent if process does not contain subscription
    if (!containsSubscription) {
      paymentIntent = await stripe.paymentIntents.update(paymentIntentId, {
        amount: !freeItem
          ? calculateOrderAmt(items, shippingPrice, tax)
          : calculateOrderAmt(
              items,
              process.env.STRIPE_SHIPPING_COST.toString(),
              tax
            ),
        receipt_email: email,
      });
    }

    if (!paymentIntent) {
      return res.status(400).json({ msg: "Could not update payment intent" });
    }

    return res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});
module.exports = router;
