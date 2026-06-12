# 🛒 E-Commerce com Moleculer
> Mini-laboratório de Arquitetura de Microsserviços Ponta-a-Ponta

---

## 📋 O que este projeto demonstra

| Padrão | Como é demonstrado |
|---|---|
| **Service Discovery** | Nenhum IP hardcoded — serviços se encontram pelo nome |
| **Load Balancing** | Escalar products-service e ver distribuição automática |
| **Circuit Breaker** | Derrubar products-service e ver fallback em ação |
| **API Gateway** | Único ponto de entrada HTTP em :3000 |
| **Event-Driven** | Criar pedido → notifications reage automaticamente |
| **Fault Tolerance** | Retry, timeout e fallback configurados |

---

## 🏗️ Arquitetura

```
                        ┌─────────────────┐
         HTTP           │                 │
Browser ─────────────► │   API Gateway   │ :3000
                        │                 │
                        └────────┬────────┘
                                 │ Moleculer RPC (NATS)
                    ┌────────────┼────────────┐
                    │            │            │
             ┌──────▼──────┐ ┌──▼──────┐    │
             │  products   │ │ orders  │    │
             │  service    │ │ service │    │
             └─────────────┘ └──┬──────┘    │
                                │ emit()     │
                                │ order.created
                         ┌──────▼──────────┐
                         │ notifications   │
                         │    service      │
                         └─────────────────┘

                    Todos conectados via NATS :4222
```

---

## 🚀 Como subir o projeto

### Pré-requisitos
- Docker Desktop rodando (ícone da baleia verde na bandeja)

### Subir todos os serviços
```bash
docker-compose up --build
```

Aguarde até ver nos logs:
```
==> Serviço "api" iniciado
==> Serviço "products" iniciado
==> Serviço "orders" iniciado
==> Serviço "notifications" iniciado
```

### Derrubar tudo
```bash
docker-compose down
```

---

## 🎬 Roteiro de Demonstração (~10 minutos)

---

### ✅ Parte 1 — Serviços no ar (1 min)

**Fala sugerida:**
> "Todos os serviços sobem com um único comando. O NATS é o transporter — o canal pelo qual os brokers se comunicam. Cada serviço ao subir se registra automaticamente no Service Registry do Moleculer, sem nenhuma configuração de IP."

**Mostrar no terminal os logs de inicialização de cada serviço.**

---

### 📦 Parte 2 — Listar produtos (1 min)

**No Postman:**
```
GET http://localhost:3000/api/products
```

**Resposta esperada:**
```json
[
  { "id": "p1", "name": "Notebook Pro",     "price": 4999.99, "stock": 10 },
  { "id": "p2", "name": "Mouse Sem Fio",    "price": 149.90,  "stock": 50 },
  { "id": "p3", "name": "Teclado Mecânico", "price": 349.90,  "stock": 25 }
]
```

**Fala sugerida:**
> "A requisição chega no API Gateway na porta 3000, que roteia para o products-service via Moleculer. Nenhum IP foi configurado — o gateway chama products.list e o Moleculer descobre onde está."

---

### 🛍️ Parte 3 — Criar pedido e ver evento (2 min)

**No Postman:**
```
POST http://localhost:3000/api/orders
Content-Type: application/json

{
  "productId": "p1",
  "quantity": 2,
  "userId": "user-42"
}
```

**Resposta esperada:**
```json
{
  "id": "ord-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "userId": "user-42",
  "productId": "p1",
  "quantity": 2,
  "totalPrice": 9999.98,
  "status": "confirmed",
  "createdAt": "2025-..."
}
```

**Mostrar no terminal o log do notifications-service:**
```
[EMAIL] Para: usuário user-42 | Pedido ord-xxx confirmado! | Produto: Notebook Pro x2 | Total: R$ 9999.98
[PUSH]  Seu pedido ord-xxx foi confirmado e está sendo processado!
```

**Fala sugerida:**
> "Aqui vemos dois padrões ao mesmo tempo. Primeiro, comunicação síncrona: o orders-service chamou o products-service para validar e reservar o estoque. Depois, comunicação assíncrona: o orders emitiu o evento order.created e o notifications reagiu automaticamente — sem que o orders soubesse que ele existe. Isso é Event-Driven."

**Mostrar que o estoque diminuiu:**
```
GET http://localhost:3000/api/products
```
> "O stock do Notebook Pro caiu de 10 para 8 — a reserva funcionou."

---

### 📋 Parte 4 — Listar pedidos (30 seg)

**No Postman:**
```
GET http://localhost:3000/api/orders
```

**Filtrar por usuário:**
```
GET http://localhost:3000/api/orders?userId=user-42
```

**Fala sugerida:**
> "Os pedidos ficam em memória no container. Em produção seria um banco de dados — mas o padrão de comunicação seria o mesmo."

---

### ❌ Parte 5 — Validação de erros (1 min)

**Produto inexistente — deve retornar 404:**
```
GET http://localhost:3000/api/products/p99
```
```json
{ "error": "Produto 'p99' não encontrado", "code": "PRODUCT_NOT_FOUND" }
```

**Estoque insuficiente — deve retornar 422:**
```
POST http://localhost:3000/api/orders
Content-Type: application/json

{
  "productId": "p2",
  "quantity": 999,
  "userId": "user-42"
}
```
```json
{ "error": "Estoque insuficiente para 'Mouse Sem Fio' (disponível: 50)", "code": "INSUFFICIENT_STOCK" }
```

**Fala sugerida:**
> "Os erros têm códigos semânticos — PRODUCT_NOT_FOUND, INSUFFICIENT_STOCK — para o front-end tratar de forma diferente. O 404 significa que não existe, o 422 significa que existe mas não pode processar."

---

### ⚡ Parte 6 — Load Balancing (2 min)

**Abrir um segundo terminal e rodar:**
```bash
docker-compose up --scale products-service=3
```

**Aguardar os logs mostrando os 3 nós registrados:**
```
==> Serviço "products" iniciado com nodeID: products-1234
==> Serviço "products" iniciado com nodeID: products-5678
==> Serviço "products" iniciado com nodeID: products-9012
```

**Fazer várias requisições no Postman:**
```
GET http://localhost:3000/api/products
```

**Fala sugerida:**
> "Escalamos para 3 instâncias do products-service com um único comando. O Moleculer detectou automaticamente os novos nós via Service Discovery e já começou a distribuir as chamadas entre eles em Round Robin — sem reiniciar nada, sem alterar nenhuma configuração."

---

### 🔌 Parte 7 — Circuit Breaker (2 min)

**Derrubar o products-service:**
```bash
docker-compose stop products-service
```

**Tentar buscar um produto — vai retornar o fallback:**
```
GET http://localhost:3000/api/products/p1
```
```json
{ "id": "p1", "name": "Produto Indisponível", "cached": true }
```

**Tentar criar um pedido — vai retornar erro claro:**
```
POST http://localhost:3000/api/orders
Content-Type: application/json

{
  "productId": "p1",
  "quantity": 1,
  "userId": "user-42"
}
```

**Fala sugerida:**
> "O products-service caiu. O Circuit Breaker detectou as falhas e abriu o circuito — agora ele nem tenta chamar o serviço, rejeita na hora e aciona o fallback. Isso evita que o orders-service fique travado esperando timeout de um serviço que claramente está fora. É a proteção contra falhas em cascata."

**Subir o products-service novamente:**
```bash
docker-compose start products-service
```

**Aguardar e fazer uma requisição — volta ao normal:**
```
GET http://localhost:3000/api/products/p1
```

**Fala sugerida:**
> "O serviço voltou. O circuito entrou em Half-Open, deixou passar uma chamada de teste, funcionou — e voltou para Closed automaticamente. Zero intervenção manual."

---

### 🏥 Parte 8 — Health Check (30 seg)

```
GET http://localhost:3000/api/health
```
```json
{ "status": "ok", "timestamp": "2025-..." }
```

**Fala sugerida:**
> "O health check é usado pelo Docker e orquestradores como Kubernetes para saber se o serviço está vivo antes de rotear tráfego para ele."

---

## 📁 Estrutura do projeto

```
lab/
├── services/
│   ├── products.service.js      # CRUD de produtos + reserva de estoque
│   ├── orders.service.js        # Criação de pedidos + evento assíncrono
│   ├── notifications.service.js # Consumidor de eventos (pub/sub)
│   └── api.service.js           # API Gateway HTTP
├── index.js                     # Bootstrap: broker + transporter + fault tolerance
├── docker-compose.yml           # Orquestração dos containers
├── Dockerfile                   # Imagem Node.js 20
└── package.json                 # Dependências
```

---

## 🔧 Configurações importantes

### Fault Tolerance (index.js)
```javascript
circuitBreaker: {
  threshold: 0.5,      // abre com 50% de erros
  windowTime: 60,      // janela de 60 segundos
  minRequestCount: 3,  // mínimo de 3 requests para avaliar
  halfOpenTime: 10000  // testa novamente após 10s
}

retryPolicy: {
  retries: 3,    // 3 tentativas
  delay: 100,    // começa com 100ms
  factor: 2      // dobra a cada tentativa (backoff exponencial)
}
```

### Serialização
```javascript
serializer: "MsgPack"  // binário, ~50% menor que JSON
```

### Transporter
```javascript
transporter: { type: "NATS" }  // canal de comunicação entre containers
```
