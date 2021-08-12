import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

//THESE NEED TO CHANGE BETWEEN PRODUCTION AND DEV
////////////////////////////////////////////////////
/////////////////////////////////////////////////////
//////////////////////////////////////////////////////
// //DEV ENDPOINTS
// export const stripePromise = loadStripe(
//   "pk_test_JzcoQtH5IWL3nAtaJG2nlYJo00dRHBf0KX"
// );

// // //webhook endpoints////////////////////////////////
// //dev
// export const ENDPOINT = "http://localhost:4000";
// const url = "http://localhost:5000/api";
// export const socketEndpoint = "http://localhost:8000";

/**************************************************** */

/****************************************************** */
/////////////////////////////////////////////////////
/////////////////////////////////////////////////////////
///////////////////////////////////////////////////////
//PRODUCTION ENDPOINTS
// // server endpoints
export const stripePromise = loadStripe(
  "pk_live_WkaincDb0zjqF6q4Vb0WLAs500UCm6ziYw"
);
export const ENDPOINT = "https://pc-slick-webhookserver.herokuapp.com/";
const url = "https://pc-slick-funnel-server.herokuapp.com/api";
export const socketEndpoint = "https://peaceful-badlands-49278.herokuapp.com/";
///////////////////////////////////////////////////////////////////

const api = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
  },
});
/**
 intercept any error responses from the api
 and check if the token is no longer valid.
 ie. Token has expired
 logout the user if the token has expired
**/

api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error(err.response);
    return Promise.reject(err);
  }
);

export default api;
