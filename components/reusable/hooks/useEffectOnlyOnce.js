import * as React from "react";

export const useEffectOnlyOnce = (callback, dependencies, condition) => {
  const calledOnce = React.useRef(false);
  console.log(callback, dependencies, condition);
  React.useEffect(() => {
    if (calledOnce.current) {
      return;
    }

    if (condition(dependencies)) {
      callback(dependencies);
      console.log(
        "/******************************DEPENDENCIES****************************/"
      );
      console.log("/*************", dependencies, "******************/");
      calledOnce.current = true;
    }
  }, [callback, condition, dependencies]);
};
