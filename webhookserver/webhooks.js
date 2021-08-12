require("dotenv").config();
const axios = require("axios");
const express = require("express");
const stripe = require("stripe")(
  process.env.NODE_ENV === "development"
    ? process.env.STRIPE_TEST_SECRET
    : process.env.STRIPE_LIVE_SECRET
);
const Shopify = require("shopify-api-node");
const cors = require("cors");
const http = require("http");
const app = express();

app.use(cors());

const shopify = new Shopify({
  shopName: "slicklove.myshopify.com",
  apiKey: process.env.SHOPIFY_ADMIN_KEY,
  password: process.env.SHOPIFY_ADMIN_PASSWORD,
});

const api = axios.create({
  baseURL: "https://api.rechargeapps.com/",
  headers: {
    "X-Recharge-Access-Token": process.env.RECHARGE_API_KEY,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const prodEndPoint =
  "https://pc-slick-funnel-server.herokuapp.com/api/store/processorder";
const devEndPoint = "http://localhost:5000/api/store/processorder";
// const prodEndPoint = "http://localhost:5000/api/store/processorder";
const devStripeSecret = process.env.STRIPE_SIGNING_SECRET_DEV.toString();
const prodStripeSecret = process.env.STRIPE_SIGNING_SECRET.toString();

console.log("NODE ENVIRONMENT:", process.env.NODE_ENV);

//Webhooks
//@route POST route
//@desc create webhook
//@access public
//ENDPOINT RECEIVES EVENTS FROM MULTIPLE STORE SITES, TREAT ALL PROCESSES THAT DO NOT HAVE SHOPIFYTOKEN AS AN OK RESPONSE
app.post(
  "/stripe",
  require("body-parser").raw({ type: "*/*" }),
  async (request, response) => {
    const signature = request.headers["stripe-signature"];
    let event;
    let order;
    try {
      event = stripe.webhooks.constructEvent(
        request.body,
        signature,
        process.env.NODE_ENV !== "development"
          ? prodStripeSecret
          : devStripeSecret
      );
      console.log("SIGNING SECRET, SUCCESSFUL");
    } catch (err) {
      console.log("ERROR FROM STRIPE ENDPOINT:", err);
      return response.status(400).json({ msg: "Webhook error" });
    }

    if (!event.data.object.metadata.shopifyToken) {
      console.error("WEBHOOK OK, No Shopify authroization");
      return response.status(200).json({
        msg:
          "WEBHOOK OK, Unauthorized order, process not originating from slick funnel",
      });
    }

    try {
      switch (event.type) {
        case "payment_intent.created":
          console.log("paymentintent created");
          response.status(200);
          break;
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;

          if (
            paymentIntent.metadata.order_source !==
            process.env.STRIPE_ORDER_SOURCE
          ) {
            return response.status(200).json({
              msg: `Order not originating from ${process.env.STRIPE_ORDER_SOURCE}, Webhook OK`,
            });
          }

          order = await handleOrderProcessing(paymentIntent);
          //order processing error? break out of hook and send a failing response
          if (order instanceof Error) {
            console.log(
              "order error !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
              order
            );
            order = {
              msg: "Error processing order",
              type: "Error",
            };

            return response.status(500).json(order);
          }

          console.log(
            `PaymentIntent for ${paymentIntent.amount} was successful`
          );

          response.status(200);
          break;
        case "payment_method.attached":
          const paymentMethod = event.data.object;

          console.log(paymentMethod);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
          response.status(200);
          break;
      }
    } catch (error) {
      console.error("ERROR FROM STRIPE ENDPOINT CATCH BLOCK:", error);
      response.status(500).json({ msg: error.response });
    }

    response.status(200).json({ msg: "Order processed" });
  }
);

//need to use bodyparse for first route^^ the rest is express
app.use(express.json({ extended: false }));

app.get("/api", (req, res) => res.send("WEBHOOK IS RUNNING"));

//call the order processing endpoint
const handleOrderProcessing = async (paymentIntent) => {
  try {
    //pass the paymentIntent data to the order endpoint
    const response = await axios.post(
      process.env.NODE_ENV === "production" ? prodEndPoint : devEndPoint,
      paymentIntent
    );

    console.log("successful order");

    return response.data;
  } catch (error) {
    return new Error(
      "Error processing your order, make sure your shipping info is correct!"
    );
  }
};

//@route POST route
//@desc cancelling whole order
//@access private
app.post("/shopify-webhook-cancel-order", async (req, res) => {
  const { note_attributes } = req.body;
  console.log("CANCELING ORDER:", note_attributes);

  try {
    if (!note_attributes || note_attributes.length === 0) {
      return res
        .status(200)
        .json({ msg: "Not a canceled order from the framework api" });
    }

    const orderSource = note_attributes.filter(
      (attr) => attr.name.toLowerCase() === "stripe order source"
    );

    if (!orderSource[0].value || !orderSource) {
      console.log("Can not determine the source of the webhook");
      return res
        .status(200)
        .json({ msg: "Can not determine the source of the webhook" });
    }

    const stripeChargeID = note_attributes.filter(
      (attr) => attr.name.toLowerCase() === "stripe charge id"
    )[0].value;

    if (!stripeChargeID) {
      console.error("ERROR FROM SHOPIFY WEBHOOK CANCEL ORDER ENDPOINT:");
      return res
        .status(200)
        .json({ msg: "Webhook failed to locate a stripe charge id" });
    }

    const foundCharge = await stripe.charges.retrieve(stripeChargeID);

    if (!foundCharge) {
      return res
        .status(200)
        .json({ msg: "Could not find a charge object with that id" });
    }

    if (process.env.NODE_ENV === "production" && !foundCharge.livemode) {
      console.error("test charge used in live mode");
      return res.status(200).json({ msg: "Test charge used in live mode" });
    }

    if (foundCharge.refunded) {
      console.log("this is a found charge error!!!!!!!", foundCharge);
      return res.status(200).json({ msg: "Charge was already refunded" });
    }

    const refund = await stripe.refunds.create({
      charge: stripeChargeID,
    });

    console.log(
      "THIS IS THE REFUND OBJECT!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    );
    console.log(refund.status);
    console.log(
      "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    );
    if (!refund) {
      return res.status(200).json({ msg: "No refund object!" });
    }
    res.json(refund);
  } catch (error) {
    console.error("there was an error processing the refund", error);
    res.status(200).json({ msg: "Internal Server Error" });
  }
});
//@route POST route
//@desc refunding from shopify api
//@access private
app.post("/shopify-webhook-refund-order", async (req, res) => {
  const { transactions, order_id } = req.body;
  console.log("TRANSACTIONSSSSSS!!!!!!", transactions);

  try {
    if (transactions.length <= 0) {
      console.log("Transactions are empty");
      return res.status(200).json({ msg: "No transactions" });
    }
    const amount = transactions.reduce((acc, lineItem) => {
      return acc + parseFloat(lineItem.amount);
    }, 0);

    //Need to locate an order to receive it's charge id
    //The found order contains details from shopify store including
    //The stripe charge ID and Customer ID
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
    console.log("FOUND AN ORDER ATTRIBUTES OBJECT:", orderAttributes);

    const orderSource = orderAttributes.filter(
      (attr) => attr.name.toLowerCase() === "stripe order source"
    );

    if (!orderSource[0].value || !orderSource) {
      console.log("Can not determine the source of the webhook");
      return res
        .status(200)
        .json({ msg: "Can not determine the source of the webhook" });
    }

    const formattedAmt = Math.floor(amount * 100);

    //get the value
    const stripeChargeID = orderAttributes.filter(
      (attr) => attr.name.toLowerCase() === "stripe charge id"
    )[0].value;

    console.log("THIS IS THE AMOUNT FGSDGDFGDSGFDSFSDFSDFSADFSFSDF", amount);

    if (!stripeChargeID) {
      return res
        .status(200)
        .json({ msg: "Webhook failed to locate a stripe charge id" });
    }

    const foundCharge = await stripe.charges.retrieve(stripeChargeID);

    if (!foundCharge) {
      console.error("could not find a charge");
      return res
        .status(200)
        .json({ msg: "Could not find a charge object with that id" });
    }

    if (process.env.NODE_ENV === "production" && !foundCharge.livemode) {
      console.error("test charge used in live mode");
      return res.status(200).json({ msg: "Test charge used in live mode" });
    }

    if (foundCharge.refunded) {
      console.log("this is a found charge error!!!!!!!", foundCharge);
      return res.status(200).json({ msg: "Charge was already refunded" });
    }

    const refund = await stripe.refunds.create({
      charge: stripeChargeID,
      amount: formattedAmt ? formattedAmt : 0,
    });

    res.json(refund);
  } catch (error) {
    console.error("there was an error processing the refund", error);
    res.status(200).json({ msg: "Internal Server Error" });
  }
});

//@route POST route
//@desc add a new subscriber to recharge subscriptions
//@access is private
//STRICTLY TESTING ENDPOINT
app.post("/recharge-webhook-add-subscription", async (req, res) => {
  //Must use an actual stripe customer's id, test data doesn;t work

  try {
    const newCustomer = {
      customer: {
        email: "alextheetestor@gmail.com",
        billing_address1: "332 E Jericho Turnpike, Huntington Station, NY",
        billing_city: "New York",
        billing_country: "United States",
        billing_first_name: "Alex",
        billing_last_name: "Test",
        billing_phone: "3103843698",
        billing_province: "New York",
        billing_zip: "11746",
        first_name: "Alex",
        last_name: "Test",
        stripe_customer_token: "cus_JL6S1rr6e58gQC",
        shopify_customer_id: 5185414856870,
      },
    };

    //customer has to be created first
    const customerResponse = await api.post("/customers", newCustomer.customer);
    console.log("created customer", customerResponse.data);

    const today = new Date();

    const dateString = today.toISOString().split("T")[0];

    if (customerResponse) {
      const newOrder = {
        order: {
          customer: {
            first_name: "Alex",
            last_name: "Roth",
            email: "alextheetestor@gmail.com",
          },
          email: "alextheetestor@gmail.com",

          financial_status: "paid",
          billing_address: {
            address1: "534 Broadhollow Road",
            address2: "",
            city: "Melville",
            company: "",
            country: "United States",
            first_name: "Alex",
            last_name: "Test",
            phone: "666-666-6666",
            province: "NY",
            zip: "11747",
          },
          shipping_address: {
            address1: "534 Broadhollow Road",
            address2: "",
            city: "Melville",
            company: "",
            country: "United States",
            first_name: "Alex",
            last_name: "Test",
            phone: "666-666-6666",
            province: "NY",
            zip: "11747",
          },
          total_tax: "12.00",
          shipping_lines: [
            {
              code: "Custom Slick Kit Funnel",
              price: "14.00",
              price_set: {
                shop_money: {
                  amount: "14.00",
                  currency_code: "USD",
                },
                presentment_money: {
                  amount: "14.00",
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
              value: "cus_I6fMeyJvLvPBcS",
            },
            {
              name: "Stripe Payment Intent",
              value: "sfsdfsdfsdfsdf",
            },
            {
              name: "Stripe Charge ID",
              value: "erw5fsdgrg",
            },
            {
              name: "Stripe Payment Method",
              value: "pm_1IiReYJ0FvsBsG7asV8Kwdae",
            },
            {
              name: "Stripe Order Source",
              value: "stripe",
            },
            { name: "Checkout Source", value: "ReCharge" },
          ],
        },
      };

      const newCheckout = {
        ...newOrder.order,
        line_items: [
          {
            charge_interval_frequency: "30",
            next_charge_scheduled_at: dateString,
            order_interval_frequency: "30",
            order_interval_unit: "day",
            product_id: 6617419776166,
            quantity: 1,
            variant_id: 39585035747494,
          },
          {
            product_id: 6617430458534,
            quantity: 1,
            variant_id: 39556205052070,
          },
        ],
      };

      const checkoutResponse = await api.post("/checkouts", newCheckout);

      if (checkoutResponse) {
        //payment token is stripe payment method
        const charge = {
          payment_processor: "stripe",
          payment_token: "pm_1IiReYJ0FvsBsG7asV8Kwdae",
        };

        const chargeResponse = await api.post(
          `/checkouts/${checkoutResponse.data.checkout.token}/charge`,
          charge
        );

        console.log("charge response!", chargeResponse);

        return res.json(chargeResponse.data);
      }
    }
  } catch (error) {
    if (error.response) {
      console.log("dis an errror frien", error.response.data);
    } else {
      console.error("fsdFSFsDfasdf", error);
    }

    res.status(500).json(error);
  }
});
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

server.listen(PORT, () =>
  console.log("Webhook server started on port:" + PORT)
);
