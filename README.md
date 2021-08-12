# **PopCrumbs Reusable Ecommerce Framework**

## This project has been developed to automate the process of creating sale funnels for existing ecommerce stores.

```
Built with NextJS/NodeJS/StripeJS/Shopify-JS/MongoDB/ReactJS/ReduxJS
```

#Setup

1. Create new private app and set access rights
2. Configure server and shopify store api route
3. change shopify tokens/passwords/domains/collectionID in store route
4. create new collection in shopify store and add the main item to #1
5. in postman retrieve the collection id from the list using admin auth
6. once new products are created and added to the collection, be sure to add isBump to the OTO products
   in order to filter which products to be featured in the upsell
7. change store connection domain in redux store
8. select the MAIN_PRODUCT by adding the item's handle from the shopify store to the .env file
