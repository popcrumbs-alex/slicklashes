const express = require("express");
const braintree = require("braintree");
const { client, shopify } = require("../server");
const handleSubscription = require("../reusable/handleSubscription");
const { handleFreeItem } = require("../reusable/handleFreeItem");
const calculateOrderAmt = require("../reusable/calculateOrderAmt");
const router = express();

//gateway is only necessary to generate a client token
//all the API info is added to recharge UI
const gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Production,
  merchantId: process.env.BT_MERCHANT_ID,
  publicKey: process.env.BT_PUBLIC_KEY,
  privateKey: process.env.BT_PRIVATE_KEY,
});

//@route GET route
//@desc get a braintree auth token
//@access private
router.get("/authtoken", async (req, res) => {
  try {
    const token = await gateway.clientToken.generate({});

    res.json(token.clientToken);
  } catch (error) {
    console.error("hmm", error);
    res.status(500).json({ msg: error });
  }
});

//@route POST route
//@desc process charge
//@access private
router.post("/charge", async (req, res) => {
  const { nonce, checkoutID, email, firstName, lastName, shippingAddress } =
    req.body;

  console.log(
    "/************************braintree************************************/"
  );
  try {
    //products is an array of product variant ids
    let products = [];

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

    const foundCustomer = await Customer.findOne({ email });

    if (!foundCustomer) {
      console.log("/*********Creating new customer***************/");

      const customerFields = {};

      if (email) customerFields.email = email;

      if (firstName && lastName)
        customerFields.name = `${firstName} ${lastName}`;

      if (shippingAddress) customerFields.shippingAddress = shippingAddress;

      customerFields.braintreeID = email;

      const newBraintreeCustomer = new Customer(customerFields);

      await newBraintreeCustomer.save();
      console.log("/*******braintree customer saved*******/");
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

      //take products from shopify inventory and create a new array of only variant ids
      products = productList.map((product) => {
        return product.variants;
      });

      //get all nested products
      const newProductList = flatten(products);

      //sort out the products to only include SKUS in the checkout object's line items
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
        return {
          variant_id: product.id,
          quantity: 1,
          product_id: product.product_id,
        };
      });

      console.log("/*****************************");
      console.log("/*******braintree items***********/");
      console.log(lineItems);
      console.log("/*********************************");
      console.log("/*******braintree items******************/");

      //locate in the checkout if one or more item is free, to only charge for shipping
      containsFreeItem = handleFreeItem(foundCheckout.lineItems);
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

      //ORDER FORMAT IS SPECIFIC TO SHOPIFY(RECHARGE) ORDER OBJECT
      const newOrder = {
        order: {
          customer: {
            first_name: firstName,
            last_name: lastName,
            email: email,
          },
          line_items: lineItems,
          financial_status: "paid",
          shipping_address: shippingAddress,
          billing_address: shippingAddress,
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
              title: "slicklashes.com (ReCharge via Braintree)",
            },
          ],
          note_attributes: [
            { name: "Order Source", value: "Braintree" },
            { name: "Payment Processor", value: "Braintree" },
            { name: "Nonce", value: nonce },
          ],
        },
      };
      const foundNewCustomer = await Customer.findOne({ email });

      newOrder.order.paymentStatus = "paid";
      newOrder.order.shopifyToken = checkoutID;
      newOrder.order.paymentGateway = "Braintree";
      newOrder.order.orderTotal = formattedPrice;
      if (foundNewCustomer) {
        foundNewCustomer.orders.push(newOrder.order);
        await foundNewCustomer.save();
      } else if (foundCustomer) {
        foundCustomer.orders.push(newOrder.order);
        await foundCustomer.save();
      }

      //TEST EMAILS FAIL WHEN CREATING AN ORDER(OBVIOUSLY DUHH) OR MAYBE THEY DONT?
      const response = await handleSubscription(
        newOrder.order,
        foundCheckout,
        res
      );

      console.log("response", response);
      // console.log("Response after shopify order creation:", response);
      // const response = newOrder.order;

      res.json(response);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }

    return res.json(payment);
  } catch (error) {
    console.log("brainteee error", error);
    res.status(500).json({ msg: error });
  }
});

module.exports = router;
