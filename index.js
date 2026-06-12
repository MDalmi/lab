"use strict";
const { ServiceBroker } = require("moleculer");

const SERVICE = process.env.SERVICE || "products";

const SERVICES_VALIDOS = ["products", "orders", "notifications", "api"];
if (!SERVICES_VALIDOS.includes(SERVICE)) {
  console.error(`Serviço inválido: "${SERVICE}". Válidos: ${SERVICES_VALIDOS.join(", ")}`);
  process.exit(1);
}

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
    minRequestCount: 3,
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

process.on("SIGINT",  () => broker.stop().then(() => process.exit(0)));
process.on("SIGTERM", () => broker.stop().then(() => process.exit(0)));

broker.start()
  .then(() => {
    broker.logger.info(`==> Serviço "${SERVICE}" iniciado com nodeID: ${broker.nodeID}`);
  })
  .catch(err => {
    broker.logger.error(`Falha ao iniciar serviço "${SERVICE}": ${err.message}`);
    process.exit(1);
  });