import Head from "next/head";
import Layout from "../components/layout/Layout";
import Header from "../components/page-components/index-page/Header";
import { useEffect, useState } from "react";
import {
  clearCheckout,
  clearSubtotal,
  getStore,
  startCheckout,
} from "../components/actions/shopifystore";
import { connect } from "react-redux";
import Reviews from "../components/page-components/index-page/Reviews";
import MoreInfo from "../components/page-components/index-page/MoreInfo";
import ReactGA from "react-ga";
import io from "socket.io-client";
import { socketEndpoint } from "../utils/api";
import { createTracking } from "../components/actions/analytics";
import Details from "../components/page-components/index-page/Details";
import ProductChoice from "../components/page-components/index-page/ProductChoice";
import UpsellProduct from "../components/page-components/index-page/UpsellProduct";
import CheckoutComponent from "../components/page-components/checkout/CheckoutComponent";
import Additions from "../components/page-components/index-page/Additions";
import TagManager from "react-gtm-module";
const socket = io(socketEndpoint);

ReactGA.initialize("UA-57087514-19", { debug: true });
ReactGA.addTrackers([
  {
    trackingId: "UA-57087514-19",
    gaOptions: {
      name: "UserTracker",
    },
  },
]);

const tagManagerArgs = {
  gtmId: "GTM-WHDSJG3",
  dataLayer: {
    userId: "tag01",
    page: "Landing",
  },
  events: {
    pageView: "pageView",
    addAddress: "addAddress",
    addBilling: "addBilling",
    addToCart: "addToCart",
    upsell: "upsell",
    upsellSkipped: "upsellSkipped",
    removeFromCart: "removeFromCart",
    finishCheckout: "finishCheckout",
    startCheckout: "startCheckout",
  },
};

if (process.browser) {
  TagManager.initialize(tagManagerArgs);
}

ReactGA.pageview("/");

const Home = ({
  getStore,
  shopifystore: { signedUp, inventory },
  reviews: { storeName },
  startCheckout,
  clearCheckout,
  clearSubtotal,
  createTracking,
}) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window?.dataLayer.push({ event: "pageView", page: "Landing" });
    }
  }, []);

  const [loadingInventory, setLoading] = useState(true);

  useEffect(() => {
    getStore();
    clearSubtotal();
    clearCheckout();
  }, []);

  //start checkout process on index page
  useEffect(() => {
    if (!signedUp) startCheckout();
  }, [signedUp]);

  //show loading graphic for inventory processing
  useEffect(() => {
    if (inventory.length <= 0) setLoading(true);
    else setLoading(false);
  }, [inventory]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.scrollTo({ top: "0" });
      }, 100);
    }

    return () => clearTimeout();
  }, []);

  //add user to socket connection
  useEffect(() => {
    socket.emit("adduser", () => {
      console.log("user added");
    });
  }, []);

  useEffect(() => {
    //start tracking user on window load
    createTracking({ checkPoint: "Home Page View" });
    ReactGA.event({ category: "PageView", action: "Home Page View" });
  }, []);

  return (
    <>
      <Head>
        <title>Slick Lash Kit</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <script
          async
          src={`//loox.io/widget/loox.js?shop=${storeName}`}
        ></script>

        {/* <!--Ever flow Tracking--> */}
        <script
          type="text/javascript"
          src="https://www.poptrkr.com/scripts/sdk/everflow.js"
        ></script>
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `EF.click({
            offer_id: EF.urlParameter('oid'),
            affiliate_id: EF.urlParameter('affid'),
            sub1: EF.urlParameter('sub1'),
            sub2: EF.urlParameter('sub2'),
            sub3: EF.urlParameter('sub3'),
            sub4: EF.urlParameter('sub4'),
            sub5: EF.urlParameter('sub5'),
            transaction_id: EF.urlParameter('__ef_tid'),
            });`,
          }}
        ></script>

        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('C09I65DOQ3DFKFN94SEG');
              ttq.page();
            }(window, document, 'ttq');
         `,
          }}
        />

        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:2377872,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `,
          }}
        />

        {/* <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-373321334"
        ></script>
        <script
          async
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} 
gtag('js', new Date()); gtag('config', 'AW-373321334');`,
          }}
        /> */}
      </Head>

      {loadingInventory ? (
        <></>
      ) : (
        <Layout>
          <Header />
          <MoreInfo />
          <Details />
          <Reviews />
          <ProductChoice />
          <Additions />
          <UpsellProduct />
          <CheckoutComponent />
        </Layout>
      )}
    </>
  );
};

const mapStateToProps = (state) => ({
  shopifystore: state.shopifystore,
  reviews: state.reviews,
});

export default connect(mapStateToProps, {
  getStore,
  startCheckout,
  clearCheckout,
  clearSubtotal,
  createTracking,
})(Home);
