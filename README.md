# Mini-Laboratório: E-Commerce com Moleculer

## Pré-requisitos
- Docker e Docker Compose instalados

## Subir os serviços
```bash
docker-compose up --build
```

## Testar
```bash
# Listar produtos
curl http://localhost:3000/api/products

# Criar pedido
curl -X POST http://localhost:3000/api/orders \
  -H 'Content-Type: application/json' \
  -d '{"productId": "p1", "quantity": 2, "userId": "user-42"}'
```

## Escalar horizontalmente
```bash
docker-compose up --scale products-service=3
```

## Testar Circuit Breaker
```bash
# Derrubar products-service
docker-compose stop products-service

# Chamada retorna fallback
curl http://localhost:3000/api/products/p1
# {"id":"p1","name":"Produto Indisponível","cached":true}
```
