module.exports.handleFreeItem = (cart) => {
  //handle if single item or whole cart is passed

  const findFreeItem = cart.filter((item) => {
    let freeItems;
    let arrTofilter = item.customAttributes || item.options;

    if (item.customAttributes) {
      freeItems = arrTofilter.filter((attr) => attr.key === "isFreeItem");
      if (freeItems.length > 0) {
        return freeItems[0].value === "true";
      }
    }

    if (item.options) {
      freeItems = arrTofilter.filter((attr) => attr.name === "isFreeItem");

      if (freeItems.length > 0) {
        return freeItems[0].values[0].value === "true";
      }
    }

    return false;
  });

  console.log(
    "free item module: Is there a free Item?",
    findFreeItem.length > 0
  );
  return findFreeItem.length > 0 ? (freeItem = true) : (freeItem = false);
};
