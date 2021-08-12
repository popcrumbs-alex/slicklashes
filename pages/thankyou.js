import React from "react";
import PropTypes from "prop-types";
import Layout from "../components/layout/Layout";
import Head from "next/head";
import { useStore } from "react-redux";
import ConfirmationComponent from "../components/page-components/confirmation/ConfirmationComponent";
import TagManager from "react-gtm-module";
import ReactGA from "react-ga";

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

const orderConfirmation = () => {
  const store = useStore();
  const {
    shopifystore: { cartSubtotal },
  } = store.getState();

  console.log("this is the revvvie", cartSubtotal);
  const EFOfferr89 = `EF.conversion({offer_id: 89,amount: ${cartSubtotal} ,order_id: 'xxx', })`;
  const fbHtml = `!function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '553195221970093');
              fbq('track', 'Purchase', { value: ${cartSubtotal}});
          `;
  const tiktokHtml = `
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('C09I65DOQ3DFKFN94SEG');
              ttq.page();
            }(window, document, 'ttq');
          `;

  return (
    <>
      <Head>
        <>
          <script
            type="text/javascript"
            src="https://www.poptrkr.com/scripts/sdk/everflow.js"
          ></script>

          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: EFOfferr89,
            }}
          />
          <iframe
            src={`https://www.poptrkr.com/?nid=577&oid=89&amount=${cartSubtotal}`}
            scrolling="no"
            frameborder="0"
            width="1"
            height="1"
          ></iframe>

          <script
            dangerouslySetInnerHTML={{
              __html: fbHtml,
            }}
          ></script>
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: tiktokHtml,
            }}
          />
          {/* <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `gtag('event', 'conversion', { 'send_to': 'AW-373321334/uXxGCOz0j5gCEPbcgbIB', 'value': ${cartSubtotal}, 'currency': 'USD', 'transaction_id': '' })`,
            }}
          /> */}
        </>
      </Head>
      <Layout>
        <ConfirmationComponent />
      </Layout>
    </>
  );
};

orderConfirmation.propTypes = {
  orders: PropTypes.object,
};

export default orderConfirmation;
