import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { PayPalButton } from "react-paypal-button-v2";
import { connect } from "react-redux";
import {
  createPaypalOrder,
  grabOrderTotal,
  updateAddressWithPaypal,
} from "../../../actions/paypalpayments";
import LoadingSpinner from "../../loading/LoadingSpinner";
import OrderProcessing from "../../../reusable/loading/OrderProcessing";
import useFreeItem from "../../../reusable/hooks/useFreeItems";
import BraintreeUI from "./BraintreeUI";
import useFormatOrderTotal from "../../../reusable/hooks/useFormatOrderTotal";
import useSubscription from "../../../reusable/hooks/useSubscription";
//prod id
const clientId =
  "AYduo-U3qxu_czUl9tEnbMOP7jwGZVoWB4Gp27IPdRNWOArq7F2-55RPMdwhx5ovuo0uGGifyJu5hkju";
//Test ID
// const clientId =
//   "AQNJcj3PfQBNLNn3ZEyJbLpTp78ykMf4KUvgYki2k6W6kl6gNjFs8O-qLlVlMlt37J67G74CE4L5Tjed";

const PayPal = ({
  shopifystore: { checkout, loading, cart, addingToCart, shippingCost },
  grabOrderTotal,
  paypalpayments: { orderTotal },
  updateAddressWithPaypal,
  createPaypalOrder,
}) => {
  const [processing, setProcessing] = useState(false);
  const [formattedItemList, formatItems] = useState([]);
  const [formattedShipping, formatShipping] = useState("");

  const containsFreeItem = useFreeItem(cart, "customAttributes", "isFreeItem");
  //only pass cart to useSub and returns a boolean
  const containsSubscription = useSubscription(
    cart,
    "customAttributes",
    "isSubscription"
  );
  //format the order total to be an int?
  const formattedTotal = useFormatOrderTotal(orderTotal);

  const handleItemFormatting = (list) => {
    const items = list.map((item) => {
      return {
        name: item.title,
        unit_amount: { value: item.variant.price, currency_code: "USD" },
        quantity: "1",
        sku: item.variant.sku,
      };
    });
    formatItems(items);
  };

  const updateShopifyShippingAddress = async (details) => {
    const {
      address_line_1 = "",
      address_line_2 = "",
      admin_area_1 = "",
      admin_area_2 = "",
      country_code = "",
      postal_code = "",
    } = details.purchase_units[0].shipping.address;

    //Format specific to shopify client api
    await updateAddressWithPaypal(
      JSON.stringify({
        address1: address_line_1,
        address2: address_line_2,
        city: admin_area_2,
        company: "",
        country: country_code,
        firstName:
          details.purchase_units[0].shipping.name.full_name.split(" ")[0],
        lastName:
          details.purchase_units[0].shipping.name.full_name.split(" ")[1],
        phone: "",
        province: admin_area_1,
        zip: postal_code,
        checkoutId: checkout.id,
      })
    );
  };

  //handle the order processing through shopify once customer uses paypal process
  const handleOrderProcess = (details) => {
    const body = {
      checkoutID: checkout.id,
      email: details.payer.email_address,
      firstName:
        details.purchase_units[0].shipping.name.full_name.split(" ")[0],
      lastName: details.purchase_units[0].shipping.name.full_name.split(" ")[1],
      shippingAddress: details.purchase_units[0].shipping.address,
      paypalID: details.id,
      paypalCustomerID: details.payer.payer_id,
      paypalOrderID: details.purchase_units[0].payments.captures[0].id,
    };

    const stringified = JSON.stringify(body);

    createPaypalOrder(stringified);
  };
  //Grab correct order amount from server
  //Order total should come back as an whole number
  useEffect(() => {
    if (checkout) grabOrderTotal({ checkoutID: checkout.id, cart });
  }, [checkout, cart]);

  //properly format cart for paypal
  useEffect(() => {
    if (cart) {
      handleItemFormatting(cart);
    }
  }, [cart]);

  useEffect(() => {
    if (shippingCost) {
      formatShipping((parseFloat(shippingCost) / 100).toFixed(2).toString());
    }
  }, [shippingCost]);

  if (loading || addingToCart) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  if (processing) {
    return <OrderProcessing />;
  }

  const {
    shippingAddress: {
      address1,
      address2,
      city,
      province,
      firstName,
      lastName,
      zip,
    },
  } = checkout;

  //generate different buttons based on item types?
  // if (containsSubscription) {
  //   return (
  //     <BraintreeUI
  //       checkout={checkout}
  //       formattedTotal={formattedTotal}
  //       clientId={clientId}
  //     />
  //   );
  // }

  return (
    <div style={{ maxWidth: "250px" }}>
      {cart.length > 0 && checkout && (
        <PayPalButton
          options={{ clientId, disableFunding: "card" }}
          createOrder={(data, actions) => {
            setProcessing(false);
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: "USD",
                    value: formattedTotal,
                    breakdown: {
                      item_total: {
                        value: formattedTotal,
                        currency_code: "USD",
                      },
                    },
                  },
                  items: [
                    ...formattedItemList,
                    {
                      name: "Tax",
                      unit_amount: {
                        value: checkout.totalTax,
                        currency_code: "USD",
                      },
                      quantity: "1",
                    },
                    {
                      name: "Shipping",
                      unit_amount: {
                        value: containsFreeItem ? formattedShipping : "0.00",
                        currency_code: "USD",
                      },
                      quantity: "1",
                    },
                  ],
                  shipping: {
                    name: { full_name: `${firstName} ${lastName}` },
                    address: {
                      address_line_1: address1,
                      address_line_2: address2,
                      country_code: "US",
                      postal_code: zip,
                      admin_area_2: city,
                      admin_area_1: province,
                    },
                  },
                },
              ],
            });
          }}
          onApprove={(data, actions) => {
            return actions.order.capture().then((details) => {
              console.log("DETAILLSSSS", details);
              setProcessing(true);
              updateShopifyShippingAddress(details);
              handleOrderProcess(details);
            });
          }}
          onError={(err) => {
            console.error("paypal error", err);
            setProcessing(false);
            return err;
          }}
        />
      )}
    </div>
  );
};

PayPal.propTypes = {};

const mapStateToProps = (state) => ({
  paypalpayments: state.paypalpayments,
  shopifystore: state.shopifystore,
});

export default connect(mapStateToProps, {
  grabOrderTotal,
  createPaypalOrder,
  updateAddressWithPaypal,
})(PayPal);
