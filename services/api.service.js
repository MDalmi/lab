"use strict";
const ApiGateway = require("moleculer-web");

module.exports = {
  name: "api",
  mixins: [ApiGateway],

  settings: {
    port: process.env.PORT || 3000,
    routes: [{
      path: "/api",
      whitelist: ["products.*", "orders.*"],
      aliases: {
        "GET  /products":      "products.list",
        "GET  /products/:id":  "products.get",
        "POST /orders":        "orders.create",
        "GET  /orders":        "orders.list",
      },
      cors: { origin: "*", methods: ["GET", "POST"] }
    }],
    log4XXResponses: true,
  }
};
