import axios from "axios";

const url = "http://localhost:8000/api";

const authApi = axios.create({
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

authApi.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error(err.response);
    return Promise.reject(err);
  }
);

export default authApi;
