import React from "react";
import { useEffect } from "react";
import { useState } from "react";

const useFormatOrderTotal = (num) => {
  const [formattedTotal, formatTotal] = useState("");

  useEffect(() => {
    formatTotal((num / 100).toFixed(2).toString());
  }, [num]);
  return formattedTotal;
};

export default useFormatOrderTotal;
