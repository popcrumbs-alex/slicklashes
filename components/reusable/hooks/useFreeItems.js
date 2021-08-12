import { useState, useEffect } from "react";

const useFreeItems = (arr, key, term) => {
  if (!arr || arr.length === 0) return;
  const [isFreeItem, setFreeItem] = useState(null);

  const handleFreeItem = (arr, key, term) => {
    //finding all attributes may return multiple arrays of arrays
    const allAttributes = arr.map((item) => {
      return item[key];
    });

    //recursively combine arrays
    const flatten = (arrs) =>
      arrs.reduce(
        (acc, next) => acc.concat(Array.isArray(next) ? flatten(next) : next),
        []
      );

    const attributes = flatten(allAttributes);

    const findFreeItem = attributes
      .filter((attr) => attr.key === term)
      .filter((obj) => obj.value === "true");
    console.log("find free item in custom hook", findFreeItem);
    setFreeItem(findFreeItem.length > 0);
  };

  useEffect(() => {
    handleFreeItem(arr, key, term);
  }, [arr]);

  return isFreeItem;
};

export default useFreeItems;
