const axios = require("axios");
const { shopify } = require("../server");

const api = axios.create({
  baseURL: "https://api.rechargeapps.com/",
  headers: {
    "X-Recharge-Access-Token": process.env.RECHARGE_API_KEY,
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const handleRechargeCustomerCreation = async (order) => {
  //this determines customer to use stripe flow
  const stripeCustomerToken =
    order.note_attributes.filter(
      (attr) => attr.name.toLowerCase() === "stripe customer id"
    )[0]?.value || "";

  //this determines a customer to use paypal checkout via braintree
  const paymentNonce =
    order.note_attributes.filter(
      (attr) => attr.name.toLowerCase() === "nonce"
    )[0]?.value || "";

  console.log("paypal customer?", paymentNonce);

  try {
    const newCustomer = {
      email: order.customer.email,
      billing_address1: order.billing_address.address1,
      billing_city: order.billing_address.city,
      billing_country: order.billing_address.country,
      billing_first_name: order.customer.first_name,
      billing_last_name: order.customer.last_name,
      billing_phone: order.billing_address.phone,
      billing_province: order.billing_address.province,
      billing_zip: order.billing_address.zip,
      first_name: order.customer.first_name,
      last_name: order.customer.last_name,
      stripe_customer_token: stripeCustomerToken || "",
    };

    //customer has to be created first
    const response = await api.post("/customers", newCustomer);

    console.log("customer!", newCustomer);

    return response.data.customer;
  } catch (error) {
    console.error("Could not create a customer because,", error.response);

    if (error.response.data) {
      console.log(error.response.data.errors);
      throw new Error(error.response);
    }

    throw new Error(error);
  }
};

const filterOutSubscriptionItems = async (order) => {
  const findItemInShopify = await shopify.product.list({ limit: 200 });

  const lineItemIds = order.line_items.map(
    (item) => item.product_id || item.variant_id
  );

  console.log("line items", lineItemIds);

  const filtered = findItemInShopify
    .filter((item) => lineItemIds.filter((id) => id === item.id).length > 0)
    .filter(
      (item) =>
        item.options.filter((opt) => opt.name === "isSubscription").length > 0
    )[0]?.id;

  if (!filtered) {
    throw new Error(
      "No subscription item exists in the cart, checkout process should not flow through here"
    );
  }
  console.log("Subscription item exists:", filtered);
  return filtered;
};

const handleRechargeCheckout = async (order) => {
  try {
    const filterById = await filterOutSubscriptionItems(order);

    const filteredOrderItems = order.line_items.filter(
      (item) => item.product_id !== filterById
    );

    const today = new Date();
    const thirtyDaysFromNow = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    const dateString = thirtyDaysFromNow.toISOString().split("T")[0];
    const newCheckout = {
      line_items: [
        ...filteredOrderItems,
        {
          charge_interval_frequency: "30",
          next_charge_scheduled_at: dateString,
          order_interval_frequency: "30",
          order_interval_unit: "day",
          product_id: 6617419776166,
          quantity: 1,
          variant_id: 39585035747494,
        },
      ],
      shipping_address: {
        ...order.shipping_address,
        first_name: order.customer.first_name,
        last_name: order.customer.last_name,
      },
      customer: order.customer,
      financial_status: "paid",
      billing_address: {
        ...order.billing_address,
        first_name: order.customer.first_name,
        last_name: order.customer.last_name,
      },
      total_tax: order.total_tax,
      tax_lines: order.tax_lines,
      transactions: order.transactions,
      shipping_lines: order.shipping_lines,
      note_attributes: [
        ...order.note_attributes,
        { name: "Checkout Source", value: "ReCharge" },
      ],
      external_checkout_source: "shopify",
      email: order.customer.email,
      discount_code: "HALFOFF",
    };

    const checkoutResponse = await api.post("/checkouts", newCheckout);

    const stripePaymentMethod = order.note_attributes.filter(
      (attr) => attr.name.toLowerCase() === "stripe payment method"
    );

    const braintreeMethod = order.note_attributes.filter(
      (attr) => attr.name.toLowerCase() === "nonce"
    );

    let paymentProcessor;

    if (stripePaymentMethod.length > 0) paymentProcessor = "stripe";

    if (braintreeMethod.length > 0) paymentProcessor = "braintree";

    //token can only exist on stripe or braintree
    const paymentToken =
      stripePaymentMethod[0]?.value || braintreeMethod[0]?.value;

    if (checkoutResponse) {
      //payment token is stripe payment method
      //For testing use tok_visa for stripe token
      const charge = {
        payment_processor: paymentProcessor,
        payment_token: paymentToken,
        payment_type: "CREDIT_CARD",
      };

      const chargeResponse = await api.post(
        `/checkouts/${checkoutResponse.data.checkout.token}/charge`,
        charge
      );

      console.log("charge response!", chargeResponse.data);

      return chargeResponse;
    }
  } catch (error) {
    console.log("recharge checkout error", error);
    if (error.response.data) {
      console.log("recharge checkout errors", error.response.data.errors);
    }
    throw new Error(error.response);
  }
};

module.exports = handleSubscription = async (order, checkout, res) => {
  let customer;
  let foundCheckout = checkout;

  console.log(/*********************************************************************
   ********************************************************************************
   *******************ORDER OBJECT****************************************/);
  console.log(order);
  console.log(/*********************************************************************
   ********************************************************************************
   *******************ORDER OBJECT****************************************/);
  try {
    customer = await handleRechargeCustomerCreation(order, foundCheckout, res);

    if (customer) {
      const checkoutResponse = await handleRechargeCheckout(order);

      console.log("recharge checkout successful!", checkoutResponse);

      return checkoutResponse.data;
    }
  } catch (error) {
    console.log("error finalizing subscription", error);
    if (error.response.data) {
      console.log("could not finalize order", error.response.data.errors);
      return res
        .status(200)
        .json({ msg: "Could not automate subscription sequence" });
    }
    return res
      .status(200)
      .json({ msg: "Could not automate subscription sequence" });
  }
};
