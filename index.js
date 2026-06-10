"use strict";
const { ServiceBroker } = require("moleculer");

const SERVICE = process.env.SERVICE || "products";

const broker = new ServiceBroker({
  nodeID: `${SERVICE}-${process.pid}`,
  transporter: {
    type: "NATS",
    options: { url: process.env.NATS_URL || "nats://localhost:4222" }
  },
  serializer: "MsgPack",
  circuitBreaker: {
    enabled: true,
    threshold: 0.5,
    windowTime: 60,
    minRequestCount: 20,
    halfOpenTime: 10000
  },
  retryPolicy: {
    enabled: true,
    retries: 3,
    delay: 100,
    maxDelay: 1000,
    factor: 2,
    check: err => err && !!err.retryable
  },
  logger: { type: "Console", options: { formatter: "short" } },
  metrics: { enabled: false }
});

broker.loadService(`./services/${SERVICE}.service.js`);

broker.start().then(() => {
  broker.logger.info(`==> Serviço "${SERVICE}" iniciado com nodeID: ${broker.nodeID}`);
});
