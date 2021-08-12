require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./middleware/connectDB");
const Client = require("shopify-buy");
const Shopify = require("shopify-api-node");
const app = express();
//connect to database
connectDB();

app.use(cors());

app.use(express.json({ extended: false }));

module.exports.shopify = new Shopify({
  shopName: "slicklove.myshopify.com",
  apiKey: process.env.SHOPIFY_ADMIN_KEY,
  password: process.env.SHOPIFY_ADMIN_PASSWORD,
});

//change the client config to new store domain as well as the token for reusability
module.exports.client = Client.buildClient({
  domain: "slicklove.myshopify.com",
  storefrontAccessToken: process.env.SHOPIFY_TOKEN,
});

app.get("/api", (req, res) => res.send("API IS RUNNING"));
app.use("/api/store", require("./routes/store"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/email", require("./routes/email"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/auth", require("./routes/admin"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/paypal", require("./routes/paypal"));
app.use("/api/braintree", require("./routes/braintree"));

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
