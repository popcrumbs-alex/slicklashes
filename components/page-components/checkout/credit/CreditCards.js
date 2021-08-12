import React, { useState } from "react";
import PropTypes from "prop-types";

const CreditCards = ({ card, style }) => {
  const [visible, showDetails] = useState(false);

  return (
    <div
      onPointerEnter={() => showDetails(true)}
      onPointerLeave={() => showDetails(false)}
      className={style.card}
    >
      {card.element}
      {visible ? (
        <div className={style.card_details}>
          <h3>{card.title}</h3>
          <div className={style.arrow_down}></div>
        </div>
      ) : (
        <div className={style.card_details_hidden}>{card.title}</div>
      )}
    </div>
  );
};

CreditCards.propTypes = {
  creditCards: PropTypes.array,
};

export default CreditCards;
