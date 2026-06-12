"use strict";

module.exports = {
  name: "notifications",

  events: {
    "order.created": {
      async handler(ctx) {
        try {
          const { order, product } = ctx.params;
          if (!order?.id || !product?.name) {
            this.logger.warn("Evento order.created recebido com dados incompletos", ctx.params);
            return;
          }
          this.logger.info(
            `[EMAIL] Para: usuário ${order.userId} | ` +
            `Pedido ${order.id} confirmado! | ` +
            `Produto: ${product.name} x${order.quantity} | ` +
            `Total: R$ ${order.totalPrice.toFixed(2)}`
          );
          this.logger.info(
            `[PUSH] Seu pedido ${order.id} foi confirmado e está sendo processado!`
          );
        } catch (error) {
          this.logger.error("Erro ao processar evento order.created", error);
        }
      }
    }
  }
};
