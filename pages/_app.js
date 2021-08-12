import "../src/css/main.css";
import React from "react";
import { useStore } from "../components/store";
import { Provider } from "react-redux";
import { motion } from "framer-motion";
import WebsocketProvider from "../components/websocketprovider/WebsocketProvider";

export default function App({ Component, pageProps, router }) {
  const store = useStore(pageProps.initialReduxState);

  return (
    <Provider store={store}>
      <WebsocketProvider>
        <motion.div
          key={router.router}
          initial="pageInitial"
          animate="pageAnimate"
          variants={{
            pageInitial: {
              opacity: 0,
            },
            pageAnimate: {
              opacity: 1,
            },
          }}
        >
          <Component {...pageProps} />
        </motion.div>
      </WebsocketProvider>
    </Provider>
  );
}
