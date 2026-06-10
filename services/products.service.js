"use strict";

module.exports = {
  name: "products",

  settings: {
    products: [
      { id: "p1", name: "Notebook Pro",     price: 4999.99, stock: 10 },
      { id: "p2", name: "Mouse Sem Fio",    price: 149.90,  stock: 50 },
      { id: "p3", name: "Teclado Mecânico", price: 349.90,  stock: 25 },
    ]
  },

  actions: {
    list: {
      rest: "GET /",
      async handler(ctx) {
        return this.settings.products;
      }
    },

    get: {
      rest: "GET /:id",
      params: { id: "string" },
      timeout: 3000,
      circuitBreaker: { enabled: true, threshold: 0.5, windowTime: 30 },
      fallback(ctx, err) {
        return { id: ctx.params.id, name: "Produto Indisponível", cached: true };
      },
      async handler(ctx) {
        const product = this.settings.products.find(p => p.id === ctx.params.id);
        if (!product) throw new Error(`Produto ${ctx.params.id} não encontrado`);
        return product;
      }
    },

    validateAndReserve: {
      params: { productId: "string", quantity: { type: "number", min: 1 } },
      async handler(ctx) {
        const { productId, quantity } = ctx.params;
        const product = this.settings.products.find(p => p.id === productId);
        if (!product) throw new Error("Produto não encontrado");
        if (product.stock < quantity) throw new Error("Estoque insuficiente");
        product.stock -= quantity;
        this.logger.info(`Estoque reservado: ${quantity}x ${product.name}`);
        return { success: true, product, reservedQty: quantity };
      }
    }
  }
};
