let autoComplete;

export const loadScript = (url, callback) => {
  let script = document.createElement("script");
  script.type = "text/javascript";

  if (script.readyState) {
    script.onreadystatechange = function () {
      if (script.readyState === "loaded" || script.readyState === "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    script.onload = () => callback();
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};

export const handleAutoComplete = (
  setQuery,
  setAddressData,
  autoCompleteRef
) => {
  autoComplete = new window.google.maps.places.Autocomplete(
    autoCompleteRef.current,
    {
      componentRestrictions: { country: "us" },
    }
  );

  autoComplete.setFields(["address_components", "formatted_address"]);

  autoComplete.addListener("place_changed", () => {
    handlePlaceSelect(setQuery, setAddressData);
  });
};

async function handlePlaceSelect(setQuery, setAddressData) {
  const addressObject = autoComplete.getPlace();
  const query = addressObject.formatted_address;
  console.log("query from auto-complete", addressObject);
  setQuery(query);
  setAddressData(addressObject.address_components);
}
