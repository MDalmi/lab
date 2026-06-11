"use strict";
const { MoleculerClientError } = require("moleculer").Errors;
const { v4: uuidv4 } = require("uuid");

const orders = [];

module.exports = {
  name: "orders",

  actions: {
    create: {
      rest: "POST /",
      params: {
        productId: "string",
        quantity: { type: "number", min: 1 },
        userId: "string"
      },
      async handler(ctx) {
        const { productId, quantity, userId } = ctx.params;

        let reservation;
        try {
          reservation = await ctx.call(
            "products.validateAndReserve",
            { productId, quantity },
            { retries: 2, timeout: 5000 }
          );
        } catch (err) {
          throw new MoleculerClientError(
            `Falha ao criar pedido: ${err.message}`,
            err.code || 500,
            "ORDER_CREATION_FAILED",
            { productId, quantity }
          );
        }

        const order = {
          id: `ord-${uuidv4()}`,
          userId,
          productId,
          quantity,
          totalPrice: reservation.product.price * quantity,
          status: "confirmed",
          createdAt: new Date().toISOString()
        };

        orders.push(order);
        await ctx.emit("order.created", { order, product: reservation.product });
        this.logger.info(`Pedido criado: ${order.id} para usuário ${userId}`);
        return order;
      }
    },

    list: {
      rest: "GET /",
      params: { userId: { type: "string", optional: true } },
      async handler(ctx) {
        const { userId } = ctx.params;
        return userId
          ? orders.filter(o => o.userId === userId)
          : orders;
      }
    }
  }
};