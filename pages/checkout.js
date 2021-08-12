import React, { useEffect } from 'react';
import Layout from '../components/layout/Layout';
import CheckoutComponent from '../components/page-components/checkout/CheckoutComponent';
import Head from 'next/head';
import { connect } from 'react-redux';
import { getStore } from '../components/actions/shopifystore';
import { useRouter } from 'next/router';

const checkout = ({ getStore, shopifystore: { foundItemName, checkout }, payments: { paymentSucceeded } }) => {
	useEffect(() => {
		getStore();
	}, []);

	const router = useRouter();

	useEffect(() => {
		if (paymentSucceeded) {
			router.push('/thankyou');
		}
	}, [paymentSucceeded]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setTimeout(() => {
				window.scrollTo({ top: '0' });
			}, 100);
		}

		return () => clearTimeout();
	}, []);

	return (
		<>
			<Head>
				<title>{foundItemName}: Checkout</title>

				<script
					dangerouslySetInnerHTML={{
						__html: `!function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '229249085011863');
              fbq('track', 'AddToCart');
          `,
					}}
				></script>
			</Head>
			<Layout>
				<CheckoutComponent />
			</Layout>
		</>
	);
};

const mapStateToProps = (state) => ({
	shopifystore: state.shopifystore,
	orders: state.orders,
	payments: state.payments,
});

export default connect(mapStateToProps, {
	getStore,
})(checkout);
