import React from "react";
import { useEffect } from "react";
import { useState } from "react";

const useSubscription = (cart, key, term) => {
  const [isSubscription, setSubscription] = useState(false);

  const findASubscription = (arr) => {
    const bIsSub =
      arr.filter((item) => {
        const subscriptions = item[key].filter((attr) => attr.key === term);
        console.log("subscriptions", item[key]);
        if (subscriptions.length > 0) {
          return subscriptions[0].value === "true";
        }

        return false;
      }).length > 0;

    setSubscription(bIsSub);
  };
  useEffect(() => {
    findASubscription(cart);
  }, [cart]);

  return isSubscription;
};

export default useSubscription;
