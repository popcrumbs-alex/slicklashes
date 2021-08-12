const calculateOrderAmt = (items, shippingPrice, tax) => {
  //shippingPrice gets passed as a whole number not a float
  //tax is float(decimal)
  const formattedPrice = parseFloat(shippingPrice);
  const formattedTax = parseFloat(tax) * 100;
  const total = items
    .map((item) => parseFloat(item.variant.price) * 100)
    .reduce((acc, next) => acc + next);

  console.log("this is the total", total + formattedPrice + formattedTax);
  return total + formattedPrice + formattedTax;
};

module.exports = calculateOrderAmt;
