//detect subscription item in cart
module.exports = handleSubscriptionItem = (cart) => {
  const findSubscription = cart.filter((item) => {
    let subscriptions;
    let arrTofilter = item.customAttributes || item.options;

    if (item.customAttributes) {
      subscriptions = arrTofilter.filter(
        (attr) => attr.key === "isSubscription"
      );
      if (subscriptions.length > 0) {
        return subscriptions[0].value === "true";
      }
    }

    if (item.options) {
      subscriptions = arrTofilter.filter(
        (attr) => attr.name === "isSubscription"
      );

      if (subscriptions.length > 0) {
        return subscriptions[0].values[0].value === "true";
      }
    }

    return false;
  });

  // console.log(
  //   "/////////////////////////////////SUBSCRIPTION/////////////////////////"
  // );
  // console.log(
  //   "handlesubscription module: is a subscription?",
  //   findSubscription
  // );
  // console.log(
  //   "/////////////////////////////////SUBSCRIPTION/////////////////////////"
  // );
  return findSubscription.length > 0;
};
