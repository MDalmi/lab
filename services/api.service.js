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
        "GET  /health":        (req, res) => {
          res.writeHead(200);
          res.end(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }));
        },
        "GET  /products":      "products.list",
        "GET  /products/:id":  "products.get",
        "POST /orders":        "orders.create",
        "GET  /orders":        "orders.list",
      },
      cors: {
        origin: "*", 
        methods: ["GET", "POST"]
      },
      onError(req, res, err) {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(err.code || 500);
        res.end(JSON.stringify({
          error: err.message,
          code: err.type || "INTERNAL_ERROR"
        }));
      }
    }],
    log4XXResponses: true,
  }
};