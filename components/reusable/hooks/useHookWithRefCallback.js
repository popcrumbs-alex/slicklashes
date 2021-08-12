import React, { useCallback, useRef } from "react";

export const useHookWithRefCallback = () => {
  const ref = useRef(null);
  const setRef = useCallback((node) => {
    if (ref.current) {
      // Make sure to cleanup any events/references added to the last instance
      console.log("this is a ref", ref.current);
      ref.current.scrollIntoView({ behavior: "smooth" });
    }

    if (node) {
      // Check if a node is actually passed. Otherwise node would be null.
      // You can now do what you need to, addEventListeners, measure, etc.
      console.log("this is a node", node);
      node.scrollIntoView({ behavior: "smooth" });
    }

    // Save a reference to the node
    ref.current = node;
  }, []);

  return [setRef];
};
