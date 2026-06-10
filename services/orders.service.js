"use strict";

let orderCounter = 1;

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

        const reservation = await ctx.call(
          "products.validateAndReserve",
          { productId, quantity },
          { retries: 2, timeout: 5000 }
        );

        const order = {
          id: `ord-${orderCounter++}`,
          userId,
          productId,
          quantity,
          totalPrice: reservation.product.price * quantity,
          status: "confirmed",
          createdAt: new Date().toISOString()
        };

        await ctx.emit("order.created", { order, product: reservation.product });
        this.logger.info(`Pedido criado: ${order.id} para usuário ${userId}`);
        return order;
      }
    },

    list: {
      rest: "GET /",
      async handler(ctx) {
        return { message: "Lista de pedidos do usuário", orders: [] };
      }
    }
  }
};
