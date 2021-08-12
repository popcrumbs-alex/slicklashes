import React from "react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import LoadingSpinner from "../loading/LoadingSpinner";
const CartItem = ({
  style,
  item,
  foundItemName,
  checkout,
  removeFromCart,
  cart,
  i,
}) => {
  const [processing, setProcessing] = useState(false);
  const foundImage = item.customAttributes.filter(
    (attr) => attr.key === "image"
  )[0].value;

  const isAddition =
    item.variant.selectedOptions.filter((opt) => opt.name === "isAddition")
      .length > 0;

  const handleItemRemoval = (item) => {
    setProcessing(true);
    removeFromCart({
      checkoutId: checkout.id,
      itemId: item.id,
    });
    //gtm tracking event
    window?.dataLayer.push({ event: 'removeFromCart', item: item?.title })
    console.log(window?.dataLayer)
  };

  //stop process when cart values change
  useEffect(() => {
    setProcessing(false);
  }, [cart]);

  if (processing) {
    return <LoadingSpinner />;
  }
  return (
    <div className={style.item} key={i}>
      <div className={style.img_container}>
        <img src={foundImage} alt={item.title} />
      </div>
      <div className={style.col}>
        <h3>
          {foundItemName !== item.title && foundItemName !== item.variant.title
            ? item.title
            : foundItemName}
        </h3>
        {item.variant.selectedOptions.filter(
          (option) => option.name.toLowerCase() === "ring size"
        ).length > 0 && (
            <p>
              Ring Size:{" "}
              {
                item.variant.selectedOptions.filter(
                  (option) => option.name.toLowerCase() === "ring size"
                )[0].value
              }
            </p>
          )}
        <p>Price:${item.variant.price}</p>

        {!isAddition && (
          <button onClick={(e) => handleItemRemoval(item)}>Remove X</button>
        )}
      </div>
    </div>
  );
};

CartItem.propTypes = {
  style: PropTypes.any,
  item: PropTypes.object,
  foundItemName: PropTypes.string,
  checkout: PropTypes.object,
  removeFromCart: PropTypes.func,
  cart: PropTypes.array,
  i: PropTypes.number,
};

export default CartItem;
