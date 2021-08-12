import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import LoadingSpinner from "../loading/LoadingSpinner";
import style from "./ProductCard.module.scss";
import { addToCart, removeFromCart } from "../../actions/shopifystore";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { connect } from "react-redux";
import Image from "next/image";

const ProductCard = ({
  addition,
  addNum,
  addToCart,
  removeFromCart,
  shopifystore: { cart, checkout },
  selectedNum,
  maxChoice,
}) => {
  const [productImage, setProductImage] = useState("");
  const [isTextVisible, toggleVisibility] = useState(false);
  const [isSelected, selectItem] = useState(false);

  const getImg = (item) => {
    const img = item.images.length > 0 && item.images[0].src;
    if (img) setProductImage(img);
  };

  //check cart values
  const checkCart = (item) => {
    const foundCartItems = cart.filter(
      (cartItem) => cartItem.variant.id === item.variants[0].id
    );

    const isInCart = foundCartItems.length > 0;
    const itemId = isInCart ? foundCartItems[0].id : "";

    console.log("is in cart?", foundCartItems);
    return { isInCart, itemId };
  };

  //specific data gets passed to add to cart function
  const handleCartAddOrRemove = (product) => {
    addToCart({
      itemData: product,
      checkoutId: checkout.id,
      variantId: product.variants[0].id,
      name: product.title,
      price: product.variants[0].price,
      description: product.description,
      image: product.images.length > 0 ? product.images[0].src : "",
      sku: product.variants[0].sku,
      itemId: product.id,
    });
  };

  //Toggling for removing and adding to cart
  //also handling of selected an non selected states
  const handleSelectItem = (item) => {
    const { isInCart, itemId } = checkCart(item);

    if (isInCart) {
      removeFromCart({ checkoutId: checkout.id, itemId });
      selectItem(false);
      addNum((prevState) => (prevState > 0 ? prevState - 1 : prevState));
    } else if (selectedNum < maxChoice) {
      addNum((prevState) => prevState + 1);
      handleCartAddOrRemove(item);
      selectItem(true);
    }
  };

  useEffect(() => {
    getImg(addition);
  }, [addition]);

  // console.log("my cart!", cart);
  if (!productImage) {
    return (
      <>
        <LoadingSpinner />
        <p>Loading image...</p>
      </>
    );
  }
  return (
    <div className={style.product_card}>
      <div className={style.card_content}>
        <div
          className={isSelected ? style.overlay_selected : style.overlay}
          onPointerEnter={(e) => toggleVisibility(true)}
          onPointerLeave={(e) => toggleVisibility(false)}
          onClick={() => toggleVisibility(true)}
        >
          {isTextVisible || isSelected ? <h3>{addition.title}</h3> : <h3></h3>}
        </div>

        <Image
          src={productImage}
          alt={"eyelashes"}
          width={600}
          height={600}
          quality="60"
          blurDataURL="https://ik.imagekit.io/usam13ogl7u/slick-logo_ND2boiQBh.png"
          placeholder="blur"
        />

        <button
          onPointerDown={() => handleSelectItem(addition)}
          className={isSelected ? style.btn_selected : ""}
        >
          {!isSelected ? <FaRegHeart size={25} /> : <FaHeart size={25} />}
        </button>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  addition: PropTypes.object,
};
const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
});
export default connect(mapStateToProps, { addToCart, removeFromCart })(
  ProductCard
);
