const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  role: {
    type: String,
    default: "customer",
  },
  stripeCustomerID: {
    type: String,
  },
  paypalCustomerID: {
    type: String,
  },
  signupDate: {
    type: Date,
    default: Date.now,
  },
  revisitingDates: [
    {
      revisitDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  shippingAddress: {
    address1: {
      type: String,
    },
    address2: {
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    province: {
      type: String,
    },
    phone: {
      type: String,
    },
  },

  orders: [
    {
      shopifyToken: {
        type: String,
        required: true,
      },
      paymentGateway: {
        type: String,
        required: true,
      },
      paymentId: {
        type: String,
      },
      stripeCustomerID: {
        type: String,
      },
      paypalID: {
        type: String,
      },
      orderTotal: {
        type: Number,
        required: true,
      },
      paymentStatus: {
        type: String,
        required: true,
      },
      orderDate: {
        type: Date,
        default: Date.now,
      },
      items: [
        {
          title: {
            type: String,
          },
          amount: {
            type: String,
          },
        },
      ],
    },
  ],
});

module.exports = Customer = mongoose.model("Customer", CustomerSchema);
