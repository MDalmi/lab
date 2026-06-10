"use strict";

module.exports = {
  name: "notifications",

  events: {
    "order.created": {
      async handler(ctx) {
        const { order, product } = ctx.params;
        this.logger.info(
          `[EMAIL] Para: usuário ${order.userId} | ` +
          `Pedido ${order.id} confirmado! | ` +
          `Produto: ${product.name} x${order.quantity} | ` +
          `Total: R$ ${order.totalPrice.toFixed(2)}`
        );
        this.logger.info(
          `[PUSH] Seu pedido ${order.id} foi confirmado e está sendo processado!`
        );
      }
    }
  }
};
