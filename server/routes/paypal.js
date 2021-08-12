const express = require("express");
require("es6-promise").polyfill();
require("isomorphic-fetch");
const Customer = require("../models/Customer");
const calculateOrderAmt = require("../reusable/calculateOrderAmt");
const { shopify, client } = require("../server");
const { handleFreeItem } = require("../reusable/handleFreeItem");
const { default: Axios } = require("axios");
const router = express.Router();

const username =
  process.env.NODE_ENV === "development"
    ? "AQNJcj3PfQBNLNn3ZEyJbLpTp78ykMf4KUvgYki2k6W6kl6gNjFs8O-qLlVlMlt37J67G74CE4L5Tjed"
    : process.env.PAYPAL_CLIENT_ID;
const password =
  process.env.NODE_ENV === "development"
    ? "EMX3PCUf5hPf9b5-LIs-anCwcjVnv6nEuh55ttdwRQsb_1eaEzi3pdWZFQelAg1YFIWsaivvWZvMdW9w"
    : process.env.PAYPAL_SECRET;

const baseUrl =
  process.env.NODE_ENV === "development"
    ? "https://api-m.sandbox.paypal.com/v2/payments/captures/"
    : "https://api-m.paypal.com/v2/payments/captures/";

const authUrl =
  process.env.NODE_ENV === "development"
    ? "https://api-m.sandbox.paypal.com/v1/oauth2/token"
    : "https://api-m.paypal.com/v1/oauth2/token";

const trackingUrl = "https://api-m.paypal.com/v1/shipping/trackers";
//Paypal Auth Middleware
const handlePayPalAuth = async (req, res, next) => {
  try {
    //Get paypal access token per request
    const auth = await Axios({
      url: authUrl,
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Language": "en_US",
        "content-type": "application/x-www-form-urlencoded",
      },
      auth: {
        username,
        password,
      },
      params: {
        grant_type: "client_credentials",
      },
    });

    const {
      data: { access_token },
    } = auth;

    req.authToken = access_token;
    next();
  } catch (error) {
    console.error(error);
    return res.status(200).json({ msg: error });
  }
};

//@route post Route
//@desc get order total from shopify checkout items
router.post("/ordertotal", async (req, res) => {
  const { checkoutID, cart } = req.body;

  let orderAmount;

  console.log("checkout id", checkoutID);

  try {
    const foundCheckout = await client.checkout.fetch(checkoutID);

    const lineItems = foundCheckout.lineItems;

    console.log("line items!", lineItems);

    if (lineItems.length > 0) {
      const isFreeItem = handleFreeItem(cart);

      if (isFreeItem) {
        orderAmount = calculateOrderAmt(
          lineItems,
          process.env.STRIPE_SHIPPING_COST,
          foundCheckout.totalTax
        );
        return res.json(orderAmount);
      }
      if (!isFreeItem) {
        orderAmount = calculateOrderAmt(lineItems, 0, foundCheckout.totalTax);
        console.log("order total for paypal", orderAmount);

        return res.json(orderAmount);
      }
    }
  } catch (error) {
    console.error("whoops", error);
    return res.status(500).json(error);
  }
});

//@route POST route
//@desc create the paypal order
//@access private
router.post("/orders/processorder", async (req, res) => {
  const {
    checkoutID,
    email,
    firstName,
    lastName,
    shippingAddress,
    paypalID,
    paypalOrderID,
    paypalCustomerID,
    paymentNonce,
  } = req.body;

  let isFreeItem;
  let isSubscription;
  let products;

  const address = {
    address1: shippingAddress.address_line_1,
    address2: shippingAddress.address_line_2
      ? shippingAddress.address_line_2
      : "",
    city: shippingAddress.admin_area_2,
    company: "",
    country: shippingAddress.country_code,
    first_name: firstName,
    last_name: lastName,
    phone: "",
    province: shippingAddress.admin_area_1,
    zip: shippingAddress.postal_code,
    name: `${firstName} ${lastName}`,
    country_code: shippingAddress.country_code,
  };

  const shopifyShippingInfo = {
    address1: shippingAddress.address_line_1,
    address2: shippingAddress.address_line_2,
    city: shippingAddress.admin_area_2,
    company: "",
    firstName,
    lastName,
    country: shippingAddress.country_code,
    phone: "",
    province: shippingAddress.admin_area_1,
    zip: shippingAddress.postal_code,
  };

  //SHOPIFYTOKEN is the checkout id
  //get checkout id passed through stripe customer object
  if (!checkoutID) {
    return res.status(400).json({ msg: "Could not locate a checkout id" });
  }

  //find checkout via customer metadata token
  const foundCheckout = await client.checkout.fetch(checkoutID);

  if (!foundCheckout) {
    return res
      .status(400)
      .json({ msg: "Could not locate a current checkout process" });
  }

  const addressResponse = await client.checkout.updateShippingAddress(
    foundCheckout.id,
    shopifyShippingInfo
  );

  console.log("response from checkout", addressResponse.shippingAddress);
  const foundCustomer = await Customer.findOne({ email });

  if (!foundCustomer) {
    console.log("No found customer, creating new customer through paypal");
    const customerFields = {};
    if (email) customerFields.email = email;
    if (firstName && lastName) customerFields.name = `${firstName} ${lastName}`;
    if (shippingAddress) {
      customerFields.shippingAddress = {
        address1: shippingAddress.address_line_1,
        address2: "",
        city: shippingAddress.admin_area_2,
        country: shippingAddress.country_code,
        zipCode: shippingAddress.postal_code,
        province: shippingAddress.admin_area_1,
        phone: "",
      };
    }
    customerFields.paypalCustomerID = paypalCustomerID;

    const newPaypalCustomer = new Customer(customerFields);

    await newPaypalCustomer.save();
    console.log("new customer created", newPaypalCustomer);
  }

  //search for products in shopify inventory
  try {
    //Make sure products exist on shopify inventory system
    const productList = await shopify.product.list({ limit: 200 });

    //need to find skus of lineitems to filter within the product list
    const lineItemSkus = foundCheckout.lineItems.map((item) => {
      return item.customAttributes.filter((attr) => attr.key === "sku")[0]
        .value;
    });

    //Recursively flatten array of products to send via order object in shopify
    const flatten = (arr) =>
      arr.reduce(
        (acc, next) => acc.concat(Array.isArray(next) ? flatten(next) : next),
        []
      );

    products = productList.map((product) => {
      return product.variants;
    });

    //get all nested products
    const newProductList = flatten(products);

    products = newProductList.filter((product, i) => {
      return lineItemSkus.includes(product.sku);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Could not load product list" });
  }

  try {
    //pull necessary data from inventory array
    const lineItems = products.map((product) => {
      return { variant_id: product.id, quantity: 1 };
    });

    console.log("line items", lineItems);

    containsFreeItem = handleFreeItem(foundCheckout.lineItems);
    //IF THE TOTAL FOR EVERYTHING IS 0
    //THIS IS A FREE ITEM
    //CHARGE SHIPPING BY CHANGING THIS
    //Calc represents the whole num for calculations
    const shippingCostForCalc = containsFreeItem
      ? process.env.STRIPE_SHIPPING_COST
      : 0;
    //shippingCost represents the formatted shipping
    const shippingCost = containsFreeItem ? process.env.SHIPPING_COST : "0";
    // console.log("STRIPE PAYMENT INTENT ON ORDER ENDPOINT:", stripeCharge);

    const totalPrice = calculateOrderAmt(
      foundCheckout.lineItems,
      shippingCostForCalc,
      foundCheckout.totalTax
    );

    const formattedPrice = (totalPrice / 100).toFixed(2);

    console.log("formated price:", formattedPrice);
    //get a true or false value from middleware by passing order items
    // isSubscription = await handleSubscriptionItem(foundCheckout.lineItems);

    const newOrder = {
      order: {
        customer: {
          first_name: firstName,
          last_name: lastName,
          email: email,
        },
        line_items: [...lineItems],
        financial_status: "paid",
        shipping_address: address,
        billing_address: address,
        total_tax: foundCheckout.totalTax,
        tax_lines: [
          { price: foundCheckout.totalTax, rate: "n/a", title: "Tax" },
        ],
        transactions: [
          {
            kind: "sale",
            status: "success",
            amount: formattedPrice,
          },
        ],
        shipping_lines: [
          {
            code: "slicklashes.com (PAYPAL)",
            price: shippingCost,
            price_set: {
              shop_money: {
                amount: shippingCost,
                currency_code: "USD",
              },
              presentment_money: {
                amount: shippingCost,
                currency_code: "USD",
              },
            },

            source: "shopify",
            title: "slicklashes.com (PAYPAL)",
          },
        ],
        note_attributes: [
          { name: "Paypal ID", value: paypalID },
          { name: "Paypal Order ID", value: paypalOrderID },
          { name: "Paypal Customer ID", value: paypalCustomerID },
          { name: "Order Source", value: "Paypal" },
          { name: "Payment Processor", value: "Paypal" },
          { name: "Nonce", value: paymentNonce || "" },
        ],
      },
    };
    const foundNewCustomer = await Customer.findOne({ email });

    newOrder.order.paymentStatus = "paid";
    newOrder.order.shopifyToken = checkoutID;
    newOrder.order.paymentGateway = "Paypal";
    newOrder.order.paypalID = paypalID;
    newOrder.order.orderTotal = formattedPrice;
    if (foundNewCustomer) {
      foundNewCustomer.orders.push(newOrder.order);
      await foundNewCustomer.save();
    } else if (foundCustomer) {
      foundCustomer.orders.push(newOrder.order);
      await foundCustomer.save();
    }

    console.log("is this a subscription item?", isSubscription);

    //TEST EMAILS FAIL WHEN CREATING AN ORDER(OBVIOUSLY DUHH) OR MAYBE THEY DONT?
    const response = await shopify.order
      .create(newOrder.order)
      .catch((err) => console.log("order error!", err.response));

    // console.log("Response after shopify order creation:", response);
    // const response = newOrder.order;

    return res.json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route POST route
//@desc add shipping information
//@access public
router.post(
  "/addshippinginfo/",

  async (req, res) => {
    const {
      address1,
      address2,
      city,
      firstName,
      lastName,
      phone,
      province,
      zip,
      checkoutId,
    } = req.body;

    const shippingInfo = {
      address1,
      address2,
      city,
      company: "",
      country: "US",
      firstName,
      lastName,
      phone,
      province,
      zip,
    };

    try {
      //find an existing checkout
      const foundCheckout = await client.checkout.fetch(checkoutId);

      if (!foundCheckout) {
        return res.status(400).json({ msg: "Could not locate a checkout" });
      }

      const response = await client.checkout.updateShippingAddress(
        checkoutId,
        shippingInfo
      );

      if (!response) {
        console.log("Could not update address");
        return res.status(400).json({ msg: "Could not process Shipping Info" });
      }

      if (response.userErrors.length > 0) {
        console.log("Could not update address");
        return res.status(400).json({
          errors: response.userErrors.map((err) => ({ msg: err.message })),
        });
      }

      console.log(response.userErrors.map((err) => err));
      console.log("successful shipping add", response);
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

//@route POST route
//@desc refund orders made through paypal
//Partial Refund flow
router.post("/paypal-refund-order", handlePayPalAuth, async (req, res) => {
  //NEED TO PROVIDE NEW ACCESS TOKEN PER REQUEST<TOKEN EXPIRES

  const { transactions, order_id } = req.body;

  console.log("auth token on refund?", req.authToken);

  const accessToken = req.authToken;

  if (!accessToken) {
    return res.status(200).json({ msg: "No Access Token Provided" });
  }

  if (!transactions || !order_id) {
    console.log("no transactions or order id provided");
    return res.status(200).json({ msg: "No order provided for refunding" });
  }

  const foundOrder = await shopify.order.get(order_id, []);
  const orderAttributes = foundOrder.note_attributes;

  if (!foundOrder) {
    return res
      .status(200)
      .json({ msg: "Could not find an order for this refund attempt" });
  }

  if (!orderAttributes || orderAttributes.length <= 0) {
    console.log("Item is not a detailed order");
    return res.status(200).json({ msg: "Item is not a detailed order" });
  }

  console.log("access token in refund body", req.body, accessToken);
  try {
    //note attributes exist on cancel order flow
    //transactions and order_id exist on partial refunding
    console.log("transactions and order id!", transactions, order_id);
    if (transactions.length === 0) {
      console.log();
      return res
        .status(200)
        .json({ msg: "No transactions present in the refund object" });
    }

    const foundOrder = await shopify.order.get(order_id, []);

    console.log("found an order", foundOrder);
    if (!foundOrder) {
      return res.status(200).json({
        msg: "Either order does not exist, or invalid order_id was provided",
      });
    }

    const orderAttributes = foundOrder.note_attributes;

    const paypalID = orderAttributes.filter(
      (attr) => attr.name.toLowerCase() === "paypal order id"
    )[0].value;

    const refundTotal = transactions[0].amount;

    console.log("REFUND TOTAL,", refundTotal);

    if (!refundTotal || parseFloat(refundTotal) === 0) {
      return res.status(200).json({ msg: "No refund amount provided" });
    }

    const response = await Axios({
      url: baseUrl + paypalID + "/refund",
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        amount: {
          value: refundTotal,
          currency_code: "USD",
        },
      },
    });

    console.log("successful partial refund", response);

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "refund error",
      error.response.data.details.map((detail) => detail)
    );
    return res.status(200).json({ msg: error });
  }
});

router.post("/paypal-cancel-order", handlePayPalAuth, async (req, res) => {
  const { note_attributes } = req.body;

  console.log("auth token on cancel?", req.authToken);
  if (!note_attributes) {
    return res.status(200).json({ msg: "No paypal reference" });
  }
  const paypalOrigin = note_attributes.filter(
    (attr) => attr.name.toLowerCase() === "payment processor"
  );

  //exit refund process if not from paypal
  if (
    paypalOrigin.length === 0 ||
    paypalOrigin[0].value.toLowerCase() !== "paypal"
  ) {
    return res.status(200).json({ msg: "Webhook not originating from paypal" });
  }

  const accessToken = req.authToken;

  if (!accessToken) {
    return res.status(200).json({ msg: "No Access Token Provided" });
  }

  try {
    console.log("note attributes?", note_attributes);
    //if note_attributes exist, this is most likely a full refund cancel order
    if (note_attributes.length === 0) {
      return res
        .status(200)
        .json({ msg: "No paypal ID was passed from the webhook" });
    }

    const paypalID = note_attributes.filter(
      (attr) => attr.name.toLowerCase() === "paypal order id"
    )[0].value;

    if (!paypalID) {
      return res
        .status(200)
        .json({ msg: "Order does not match a paypal order, Webhook OK" });
    }
    //empty body sends request for cancel order
    const response = await Axios({
      url: baseUrl + paypalID + "/refund",
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("cancel order response!", response);

    if (!response) {
      return res
        .status(200)
        .json({ msg: "Something went wrong refunding an order" });
    }

    return res.status(200).json(response.data);
  } catch (error) {
    if (error.response.data) {
      console.error(
        "cancel order errors",
        error.response.data.details.map((detail) => detail)
      );
    }

    console.log("cancel order error", error);
    res.status(200).json({ msg: error });
  }
});

//@post Route
//@desc receive shipping update info and send to paypal
//@access private
router.post("/update-tracking-paypal", handlePayPalAuth, async (req, res) => {
  console.log(
    "Tracking info: ",
    req.body.tracking_number,
    req.body.order_id,
    req.body.tracking_company,
    req.body.shipment_status
  );

  const accessToken = req.authToken;

  const { tracking_number, order_id, tracking_company, shipment_status } =
    req.body;
  try {
    const foundOrder = await shopify.order.get(order_id);

    //need to receive the note_attributes for paypal id
    const orderAttributes = foundOrder.note_attributes;

    if (!orderAttributes || orderAttributes.length === 0) {
      console.log("No auth for webhook");
      return res.status(200).json({ msg: "No authorization for webhook" });
    }

    const paypalTransactionID = orderAttributes.filter(
      (attr) => attr.name.toLowerCase() === "paypal order id"
    );

    if (!paypalTransactionID || paypalTransactionID.length === 0) {
      console.log("No Paypal ID");
      return res.status(200).json({ msg: "No Paypal Order ID" });
    }

    const paypalID = paypalTransactionID[0].value;

    const shippingUpdate = {
      transaction_id: paypalID,
      tracking_number: tracking_number,
      carrier: "OTHER",
      status: "SHIPPED",
      carrier_name_other: tracking_company,
    };

    console.log("shipping update", shippingUpdate);

    const trackingUpdate = await Axios({
      url: `${trackingUrl}/`,
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Language": "en_US",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        trackers: [shippingUpdate],
      },
    });

    console.log("tracking made it", trackingUpdate.data);

    return res.status(200).json(trackingUpdate.data);
  } catch (error) {
    console.error(
      "tracking update error:",
      error.response.body,
      error.response.data.errors.map((err) => {
        return { err, deets: JSON.stringify(err.details) };
      })
    );
    res.status(200).json({ error });
  }
});

//manual tracking update endpoint
router.put("/updatetracking", handlePayPalAuth, async (req, res) => {
  const {
    tracking_number,
    order_id,
    tracking_company,
    paypalID,
    shipment_status,
  } = req.body;

  const accessToken = req.authToken;

  // console.log("access token~", accessToken);
  try {
    const shippingUpdate = {
      transaction_id: paypalID,
      tracking_number: tracking_number,
      status: shipment_status === null ? "in_process" : shipment_status,
      carrier: tracking_company,
    };

    const trackingUpdate = await Axios({
      url: `${trackingUrl}/`,
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Language": "en_US",
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        trackers: [shippingUpdate],
      },
    });
    console.log(shippingUpdate, trackingUpdate);
    return res.json(trackingUpdate.data);
  } catch (error) {
    console.error("tracking update error", error);
    return res.json(error);
  }
});
module.exports = router;
