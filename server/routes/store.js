const express = require("express");
require("es6-promise").polyfill();
require("isomorphic-fetch");
const { check, validationResult } = require("express-validator");
const Customer = require("../models/Customer");
const stripe = require("stripe")(
  process.env.NODE_ENV !== "development"
    ? process.env.STRIPE_LIVE_SECRET
    : process.env.STRIPE_TEST_SECRET
);
const calculateOrderAmt = require("../reusable/calculateOrderAmt");
const apiAuth = require("../middleware/apiAuth");
const handleSubscription = require("../reusable/handleSubscription");
const handleSubscriptionItem = require("../reusable/handleSubscriptionItem");
const { shopify, client } = require("../server");
const { handleFreeItem } = require("../reusable/handleFreeItem");
const router = express.Router();

console.log("dev mode", process.env.NODE_ENV);

router.get("/collections", apiAuth, async (req, res) => {
  const { filter } = req.body;
  try {
    const collections = await client.collection.fetchAll(200);

    if (filter) {
      const regex = new RegExp(filter, "gi");
      const filtered = collections.filter((collection) => {
        return collection.title.match(regex);
      });

      return res.json({ filtered });
    }

    res.json({ collections });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

//@route GET route
//@desc get store inventory
//@access public
//UPDATE THE COLLECTION ID FOR EACH FUNNEL
router.get("/inventory", async (req, res) => {
  try {
    const collection = await client.collection.fetchWithProducts(
      "Z2lkOi8vc2hvcGlmeS9Db2xsZWN0aW9uLzI2Mjc4ODcxMDU2Ng==",
      { productsFirst: 30 }
    );

    if (!collection) {
      return res.status(300).json({ inventory: [], mainProduct: {} });
    }

    const inventory = collection.products;

    const mainProduct = inventory.filter((product) => {
      const storeItem = process.env.MAIN_PRODUCT.toLowerCase();

      const regex = new RegExp(storeItem, "i");
      return product.handle.toLowerCase().match(regex);
    })[0];

    res.json({ inventory, mainProduct });
  } catch (error) {
    console.error(error);
    res.status(300).json({ inventory: [], mainProduct: {} });
  }
});

//@route GET route
//@desc get admin product info
//@access private
//use this route to retrieve a variant id from admint endpoint
router.get("/product", async (req, res) => {
  const { productId } = req.body;
  try {
    const product = await shopify.product.get(productId);

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
});

//@route POST route
//@desc start a checkout process
//@access private
router.post("/startprocess", async (req, res) => {
  try {
    const response = await client.checkout.create();

    if (!response) {
      return res
        .status(400)
        .json({ msg: "Hmm something went wrong, please try again" });
    }

    const formattedShippingCost = Math.ceil(
      parseFloat(process.env.SHIPPING_COST) * 100
    ).toString();

    const attributes = {
      customAttributes: {
        key: "shippingCost",
        value: formattedShippingCost,
      },
    };

    await client.checkout.updateAttributes(response.id, attributes);

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route POST route
//@desc update checkout
//@access private
//TODO may need to fix this if billing address gets overwritten in attribute updates
router.post(
  "/updatecheckout",

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, name, checkoutId } = req.body;

    if (email === null || email === "") {
      return res.status(200).json({ msg: "No email provided yet" });
    }

    const attributes = {
      customAttributes: [],
    };

    // console.log("updatecheckout found", foundCheckout.lineItems);

    const formattedShippingCost = Math.ceil(
      parseFloat(process.env.SHIPPING_COST) * 100
    ).toString();

    //keep the existing attributes in the object
    if (email) attributes.customAttributes.push({ key: "email", value: email });
    if (name) attributes.customAttributes.push({ key: "name", value: name });

    attributes.customAttributes.push({
      key: "shippingCost",
      value: formattedShippingCost,
    });

    try {
      let foundCustomer;

      if (email) foundCustomer = await Customer.findOne({ email });

      const customerFields = {};

      if (foundCustomer) {
        const revisitDate = { revisitDate: new Date() };
        foundCustomer.revisitingDates.push(revisitDate);
        foundCustomer.name = name;
        await foundCustomer.save();
      }

      if (!foundCustomer) {
        customerFields.email = email;
        customerFields.name = name;

        const newCustomer = new Customer({ ...customerFields });

        await newCustomer.save();

        console.log("new CUSTOMER SIGNUP", newCustomer);
      }

      const response = await client.checkout.updateAttributes(
        checkoutId,
        attributes
      );

      return res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

//@route GET route
//@desc get a certain checkout
//@access private
router.get("/retrievecheckout/:id", async (req, res) => {
  console.log(req.params.id);
  try {
    const response = await client.checkout.fetch(req.params.id);

    if (!response) {
      return res.status(400).json({ msg: "Could not locate checkout object" });
    }

    // console.log(JSON.stringify(response));

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route POST route
//@desc add shipping information
//@access public
router.post(
  "/addshippinginfo/",
  [
    check("address1", "Please add your address").not().isEmpty(),
    check("address1", "Please enter a valid address").isLength({ min: 4 }),
    check("city", "Please add your city").not().isEmpty(),
    check("firstName", "Please enter your first name").not().isEmpty(),
    check(
      "firstName",
      "Your name cannot contain numbers(Unless your the child of Elon Musk"
    )
      .not()
      .isNumeric(),
    check("lastName", "Please enter your last name").not().isEmpty(),
    check(
      "lastName",
      "Your name cannot contain numbers(Unless your the child of Elon Musk"
    )
      .not()
      .isNumeric(),
    check("phone", "Please enter a valid phone number").isMobilePhone(),
    check("phone", "Please enter your phone number").not().isEmpty(),
    check("province", "Please enter your state").not().isEmpty(),
    check("zip", "Please enter your zip code").not().isEmpty(),
    check("zip.*", "Please enter a valid zip code").isPostalCode(),
    check("email", "Please enter your email").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
      email,
      isBillingAddress = false,
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

    const regexFilter = new RegExp(/[@/&/%/#/^/!]/, "gi");

    const incorrectAddress = regexFilter.test(address1);

    if (incorrectAddress) {
      return res
        .status(400)
        .json({ msg: "Address cannot contain special characters" });
    }
    try {
      //find an existing checkout
      const foundCheckout = await client.checkout.fetch(checkoutId);

      if (!foundCheckout) {
        return res.status(400).json({ msg: "Could not locate a checkout" });
      }

      //grab the custom attributes for the check out in order to maintain the same attributes for when
      //the shipping address is updated
      const foundAttributes = [...foundCheckout.customAttributes].map((obj) => {
        return { key: obj.key, value: obj.value };
      });

      //   console.log(foundAttributes);
      //Handle billing address updates and short out of process if billing address
      if (isBillingAddress) {
        const attributes = {
          customAttributes: [
            ...foundAttributes,
            { key: "email", value: email },
            {
              key: "billing_address",
              value: JSON.stringify({ ...shippingInfo }),
            },
          ],
        };

        //   add the email to the user's checkout object
        const response = await client.checkout.updateAttributes(
          checkoutId,
          attributes
        );

        return res.json(response);
      }

      //only update the email address here
      const attributes = {
        customAttributes: [...foundAttributes, { key: "email", value: email }],
      };

      //   add the email to the user's checkout object
      const update = await client.checkout.updateAttributes(
        checkoutId,
        attributes
      );

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

      if (update.userErrors.length > 0) {
        console.log("Could not update address");
        return res.status(400).json({
          errors: update.userErrors.map((err) => err.message),
        });
      }

      console.log(response.userErrors.map((err) => err));
      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

//@route POST route
//@desc add items to cart
//@access private
router.post("/addtocart", async (req, res) => {
  const {
    name,
    price,
    image,
    description,
    variantId,
    checkoutId,
    sku,
    itemData,
  } = req.body;

  if (!checkoutId) {
    return res.status(400).json({ msg: "No Checkout process started" });
  }

  const isFreeItem = handleFreeItem([itemData]);

  const isSubscription = handleSubscriptionItem([itemData]);

  console.log("IS THERE A SUBSCRIPTION IN DIS BIDDY", isSubscription);

  const cartItem = {
    quantity: 1,
    variantId: variantId,
    customAttributes: [
      {
        key: "name",
        value: name,
      },
      {
        key: "price",
        value: price,
      },
      { key: "description", value: description },
      { key: "image", value: image },
      { key: "sku", value: sku },
      {
        key: "shippingCost",
        value: isFreeItem ? process.env.SHIPPING_COST : "0",
      },
      { key: "isFreeItem", value: isFreeItem ? "true" : "false" },
      { key: "isSubscription", value: isSubscription ? "true" : "false" },
    ],
  };
  try {
    const response = await client.checkout.addLineItems(checkoutId, cartItem);

    console.log(name + "Added to cart");

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route POST route
//@desc Remove line item
//@access private
router.post("/removefromcart", async (req, res) => {
  const { checkoutId, itemId } = req.body;

  if (!checkoutId || !itemId) {
    return res.status(400).json({ msg: "Could not remove item" });
  }

  const itemsToRemove = [itemId];

  try {
    const response = await client.checkout.removeLineItems(
      checkoutId,
      itemsToRemove
    );

    res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route GET route
//@desc retireve shipping costs for free items
//@access private
router.get("/retrieveshippingcost", async (req, res) => {
  //route should return a whole number, not a float
  if (process.env.STRIPE_SHIPPING_COST) {
    return res.json(process.env.STRIPE_SHIPPING_COST);
  } else return res.status(300).json({ msg: "No Shipping Price Set" });
});

//@route POST route
//@desc bulk removal of cart items
//@access private
router.post("/bulkremovefromcart", async (req, res) => {
  const { checkoutId, itemIds } = req.body;

  if (!checkoutId || itemIds.length === 0) {
    return res.status(400).json({ msg: "Could not remove item" });
  }

  const itemsToRemove = [...itemIds];

  try {
    const response = await client.checkout.removeLineItems(
      checkoutId,
      itemsToRemove
    );

    res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route POST route
//@desc complete checkout process/redirect to shopify
//@access private
router.post(
  "/completecheckout",
  [
    check("email", "Please enter your email").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { checkoutId, email } = req.body;

    const foundCheckout = await client.checkout.fetch(checkoutId);

    if (!foundCheckout) {
      return res
        .status(400)
        .json({ msg: "Could not find an existing checkout process" });
    }

    if (
      foundCheckout.shippingAddress === null ||
      !foundCheckout.shippingAddress
    ) {
      return res.status(400).json({
        msg: "Please add your shipping info before placing your order",
      });
    }
    if (foundCheckout.lineItems.length <= 0) {
      return res
        .status(400)
        .json({ msg: "There does not seem to be any items in your cart" });
    }

    if (!foundCheckout.webUrl) {
      return res
        .status(400)
        .json({ msg: "Could not redirect you to finish checkout process" });
    }

    try {
      const updatedAttributes = {
        customAttributes: [{ key: "email", value: email }],
      };
      const response = await client.checkout.updateAttributes(
        checkoutId,
        updatedAttributes
      );
      res.json(response);
    } catch (error) {
      console.error("error from complete checkout api", error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  }
);

//@route GET route
//@desc get store shipping info
//@access public
router.get("/shippinginfo", async (req, res) => {
  const shippingZone = await shopify.carrierService.list();

  try {
    res.json(shippingZone);
  } catch (error) {
    console.error(shippingZone);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route POST route
//@desc create an order
//@access private
//TODO clean this route up GEEZ
router.post("/processorder", async (req, res) => {
  const { metadata } = req.body;

  let isSubscription;
  let products;
  let containsFreeItem;
  //SHOPIFYTOKEN is the checkout id
  //get checkout id passed through stripe customer object
  if (!metadata.shopifyToken) {
    return res.status(400).json({ msg: "Could not locate a checkout id" });
  }

  //find checkout via customer metadata token
  const foundCheckout = await client.checkout.fetch(metadata.shopifyToken);

  if (!foundCheckout) {
    return res
      .status(400)
      .json({ msg: "Could not locate a current checkout process" });
  }

  const foundCustomer = await Customer.findOne({ email: metadata.email });

  if (!foundCustomer) {
    return res.status(400).json({ msg: "Could not locate customer object" });
  }

  //locate an order within a customer object
  const foundPendingOrder = await foundCustomer.orders.filter(
    (order) => order.shopifyToken === metadata.shopifyToken
  )[0];

  if (!foundPendingOrder) {
    console.error("Could not locate a matching order in the database");
    return res.status(400).json({ msg: "Processing Error" });
  }

  //search for products in shopify inventory
  try {
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

    const newProductList = flatten(products);

    products = newProductList.filter((product, i) => {
      return lineItemSkus.includes(product.sku);
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Could not load product list" });
  }

  try {
    // TODO figure out a better way to pass checkout id through shopify customer
    const shippingAddress = foundCheckout.shippingAddress;
    //get the user email value passed as a custom attribute
    const userEmail = foundCheckout.customAttributes.filter(
      (attr) => attr.key === "email"
    )[0].value;

    //only use if billing address is different from shipping address
    let billingAddress;
    let billingAddressParsed;
    if (
      foundCheckout.customAttributes.filter(
        (attr) => attr.key === "billing_address"
      ).length > 0
    ) {
      billingAddress = foundCheckout.customAttributes.filter(
        (attr) => attr.key === "billing_address"
      )[0].value;

      billingAddressParsed = JSON.parse(billingAddress);
      billingAddressParsed.country_code = "US";
    }

    //pull necessary data from inventory array
    const lineItems = products.map((product) => {
      return {
        variant_id: product.id,
        quantity: 1,
        product_id: product.product_id,
      };
    });

    const subtotal = calculateOrderAmt(foundCheckout.lineItems, 0, 0) / 100;

    //Get stripe payment intent to save charge id on shopify
    const stripeCharge = await stripe.paymentIntents.retrieve(
      foundPendingOrder.paymentId
    );

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

    //get a true or false value from middleware by passing order items
    isSubscription = handleSubscriptionItem(foundCheckout.lineItems);

    const newOrder = {
      order: {
        customer: {
          first_name: shippingAddress.firstName,
          last_name: shippingAddress.lastName,
          email: userEmail,
        },
        line_items: [...lineItems],
        financial_status: "paid",
        shipping_address: shippingAddress,
        billing_address: billingAddressParsed
          ? {
              address1: billingAddressParsed.address1,
              address2: billingAddressParsed.address2,
              city: billingAddressParsed.city,
              company: null,
              country: "United States",
              first_name: billingAddressParsed.firstName,
              last_name: billingAddressParsed.lastName,
              phone: billingAddressParsed.phone,
              province: billingAddressParsed.province,
              zip: billingAddressParsed.zip,
              name: `${billingAddressParsed.firstName} ${billingAddressParsed.lastName}`,
              province_code: billingAddressParsed.province_code,
              country_code: "US",
              latitude: null,
              longitude: null,
            }
          : shippingAddress,
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
            code: "Custom Slick Kit Funnel",
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
            title: "Custom Slick Kit Funnel",
          },
        ],
        note_attributes: [
          {
            name: "Stripe Customer ID",
            value: foundPendingOrder.stripeCustomerID,
          },
          {
            name: "Stripe Payment Intent",
            value: foundPendingOrder.paymentId,
          },
          {
            name: "Stripe Charge ID",
            value: stripeCharge.charges.data[0].id,
          },
          { name: "Stripe Payment Method", value: stripeCharge.payment_method },
          {
            name: "Stripe Order Source",
            value: process.env.STRIPE_ORDER_SOURCE,
          },
          { name: "Payment Processor", value: "Stripe" },
        ],
      },
    };
    //find order in db
    //set it to paid
    foundCustomer.orders.filter((order) => {
      return order.shopifyToken === metadata.shopifyToken;
    })[0].paymentStatus = "paid";

    await foundCustomer.save();
    ///////////////////////////////////////////
    //////////RECHARGE//////////////////////////
    ///////////////////////////////////////////
    //TRANSFER CHECKOUT PROCESS TO RECHARGE API
    //this is if only a subscription based item exists in the order
    //pass the products to the function to identify the sub item
    if (isSubscription) {
      //send the refund to stripe after recharge checkout processes
      //auto refund a stripe charge when going through recharge
      //refund amount/ process amount should always be 50 cents
      const refund = await stripe.refunds.create({
        charge: stripeCharge.charges.data[0].id,
        amount: 50,
      });

      const response = await handleSubscription(
        newOrder.order,
        foundCheckout,
        res
      );

      console.log("recharge checkout", "refunded in stripe", refund);
      return res.json(response);
    }
    ///////////////////////////////////////////
    //////////RECHARGE//////////////////////////
    ///////////////////////////////////////////

    /////////////SHOPIFY/////////////////////////////
    const response = await shopify.order.create(newOrder.order);
    // const response = newOrder.order;\

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

//@route GET route
//@desc get order
//@access private
router.get("/getorder/:id", async (req, res) => {
  const foundOrder = await shopify.order.get(req.params.id);

  if (!foundOrder) {
    return res.status(400).json({ msg: "Could not locate order" });
  }

  // console.log("found the order by id", foundOrder);

  try {
    res.json(foundOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

module.exports = router;
