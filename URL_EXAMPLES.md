# URL Examples for Order Payment Page

## URL Completa con Todos los Query Params

### Ejemplo 1: URL con orderId (recomendado - carga datos del backend)

```
/order/?orderId=f6c1f82f-8956-4bc4-a800-a8d505820a33
```

Si está desplegado:
```
https://menu.agenticfloai.com/order/?orderId=f6c1f82f-8956-4bc4-a800-a8d505820a33
```

### Ejemplo 2: URL Completa con Todos los Parámetros Manuales

```
/order/?orderId=f6c1f82f-8956-4bc4-a800-a8d505820a33&phoneNumber=%2B1%20%28555%29%20123-4567&paymentAmount=250.75&redirectUrl=https%3A%2F%2Fagentic.io%2Fpayment%2Fsuccess&redirectUrlError=https%3A%2F%2Fagentic.io%2Fpayment%2Ferror&items=%5B%7B%22itemId%22%3A%22item-001%22%2C%22name%22%3A%22Pepperoni%20Pizza%20%28Medium%29%22%2C%22quantity%22%3A2%2C%22basePrice%22%3A12.99%2C%22modifiers%22%3A%5B%7B%22name%22%3A%22Extra%20Cheese%22%2C%22priceAdjustment%22%3A1.5%7D%2C%7B%22name%22%3A%22Pepperoni%22%2C%22priceAdjustment%22%3A0.75%7D%5D%2C%22itemTotal%22%3A30.48%7D%2C%7B%22itemId%22%3A%22item-002%22%2C%22name%22%3A%22Coca%20Cola%20%28Large%29%22%2C%22quantity%22%3A1%2C%22basePrice%22%3A3.99%2C%22modifiers%22%3A%5B%5D%2C%22itemTotal%22%3A3.99%7D%5D
```

### Ejemplo 3: URL Decodificada (para referencia)

```
/order/
  ?orderId=f6c1f82f-8956-4bc4-a800-a8d505820a33
  &phoneNumber=+1 (555) 123-4567
  &paymentAmount=250.75
  &redirectUrl=https://agentic.io/payment/success
  &redirectUrlError=https://agentic.io/payment/error
  &items=[{"itemId":"item-001","name":"Pepperoni Pizza (Medium)","quantity":2,"basePrice":12.99,"modifiers":[{"name":"Extra Cheese","priceAdjustment":1.5},{"name":"Pepperoni","priceAdjustment":0.75}],"itemTotal":30.48},{"itemId":"item-002","name":"Coca Cola (Large)","quantity":1,"basePrice":3.99,"modifiers":[],"itemTotal":3.99}]
```

## Parámetros Requeridos

- **orderId** (string, requerido): ID único de la orden
- **phoneNumber** (string, requerido): Número de teléfono del cliente
- **items** (string, requerido): Array JSON codificado con los items de la orden
- **paymentAmount** (number, requerido): Monto total a pagar

## Parámetros Opcionales

- **redirectUrl** (string, opcional): URL de redirección en caso de éxito
- **redirectUrlError** (string, opcional): URL de redirección en caso de error

## Estructura del Array de Items

Cada item debe tener la siguiente estructura:

```json
{
  "itemId": "string",
  "name": "string",
  "quantity": number,
  "basePrice": number,
  "modifiers": [
    {
      "name": "string",
      "priceAdjustment": number
    }
  ],
  "itemTotal": number
}
```

## Notas

- Si solo se proporciona `orderId`, la página intentará cargar los datos del backend
- Si el backend no responde o no hay `orderId`, se usan datos mockeados
- El parámetro `items` debe ser un JSON stringificado y luego codificado con `encodeURIComponent`
- Los parámetros `redirectUrl` y `redirectUrlError` también deben estar codificados

