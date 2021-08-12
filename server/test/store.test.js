require("es6-promise").polyfill();
require("isomorphic-fetch");
const Client = require("shopify-buy");
const client = Client.buildClient({
  domain: "pendant-test-store.myshopify.com",
  storefrontAccessToken: "968f0e0fd610ed6cc25596ba1498c6a5",
});

const assert = require("assert");
const { doesNotMatch } = require("assert");

describe("GET api/store/inventory", function () {
  it("Should return an array of objects", function (done) {
    client.product
      .fetchAll()
      .then((response) => {
        console.log(JSON.stringify(response));
        const result = JSON.stringify(response);
        done();
      })
      .catch((err) => {
        console.error("this is an error", err);
        if (err) return done(err);
      });
  });
});

describe("Post, api/store/startprocess", function () {
  it("Should return an object with checkout info", function (done) {
    client.checkout
      .create()
      .then((response) => {
        console.log(JSON.stringify(response));
        const result = JSON.stringify(response);
        done();
      })
      .catch((err) => {
        console.error(err);
        if (err) return done(err);
      });
  });
});

//TODO fix so that test isn't retrieving with specific id
describe("Get, api/store/retrievecheckout/:id", function () {
  it("Should retrieve one object based on ID given", function (done) {
    client.checkout
      .fetch(
        "Z2lkOi8vc2hvcGlmeS9DaGVja291dC83YjQ1ZTJjZjE5MDI0ODczYTY0YjBkNjQ5MjI1MWZkNj9rZXk9MGFkMjJjN2RmYmE0YmJkZjc5MDIwNmYyYzU0MjhmNWE="
      )
      .then((response) => {
        console.log(JSON.stringify(response));
        done();
      })
      .catch((err) => {
        if (err) return done(err);
      });
  });
});

describe("POST, api/store/addshippinginfo", function () {
  it("Should return an updated checkout object, containing shipping info", (done) => {
    const checkoutId =
      "Z2lkOi8vc2hvcGlmeS9DaGVja291dC83YjQ1ZTJjZjE5MDI0ODczYTY0YjBkNjQ5MjI1MWZkNj9rZXk9MGFkMjJjN2RmYmE0YmJkZjc5MDIwNmYyYzU0MjhmNWE=";
    const shippingInfo = {
      address1: "Chestnut Street 92",
      address2: "Apartment 2",
      city: "Louisville",
      company: null,
      country: "United States",
      firstName: "Bob",
      lastName: "Norman",
      phone: "555-625-1199",
      province: "Kentucky",
      zip: "40202",
    };
    client.checkout
      .updateShippingAddress(checkoutId, shippingInfo)
      .then((response) => {
        console.log(JSON.stringify(response));
        done();
      })
      .catch((err) => {
        console.log(err);
        if (err) return done(err);
      });
  });
});

describe("POST, api/store/addtocart", function () {
  it("Should add lineitems to checkout object", (done) => {
    const checkoutId =
      "Z2lkOi8vc2hvcGlmeS9DaGVja291dC85MWEyYzI3MDcwMWViOGM1ZTk0NDUyNzg0ODExYzhhMz9rZXk9NGEyYzUxYmZjNDU1M2Q4ZTdlNzRkNjIzNGUyNmE3ODk=";

    const cartItem = {
      quantity: 1,
      variantId: "Z2lkOi8vc2hvcGlmeS9Qcm9kdWN0VmFyaWFudC8zNTg2NzcwNTExNDc4Ng==",
      customAttributes: [
        {
          key: "name",
          value: "Pendant",
        },
        {
          key: "price",
          value: "20.00",
        },
        { key: "description", value: "Gold" },
        { key: "image", value: "image url" },
      ],
    };
    client.checkout
      .addLineItems(checkoutId, cartItem)
      .then((response) => {
        console.log(JSON.stringify(response));
        done();
      })
      .catch((err) => {
        if (err) return done(err);
      });
  });
});

describe("POST, api/store/completecheckout", function () {
  it("Should return checkout object fully filled out data", (done) => {
    const checkoutId =
      "Z2lkOi8vc2hvcGlmeS9DaGVja291dC85MWEyYzI3MDcwMWViOGM1ZTk0NDUyNzg0ODExYzhhMz9rZXk9NGEyYzUxYmZjNDU1M2Q4ZTdlNzRkNjIzNGUyNmE3ODk=";
    const updatedAttributes = {
      customAttributes: [
        { key: "email", value: "alex@gmail.com" },
        { key: "password", value: "password!" },
      ],
    };
    client.checkout
      .updateAttributes(checkoutId, updatedAttributes)
      .then((result) => {
        console.log(JSON.stringify(result));
        done();
      })
      .catch((err) => {
        console.log(err);
        if (err) return done(err);
      });
  });
});
