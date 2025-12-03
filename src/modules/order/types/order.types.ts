export interface OrderItemModifier {
  name: string
  priceAdjustment: number
}

export interface OrderItem {
  itemId: string
  name: string
  quantity: number
  basePrice: number
  modifiers: OrderItemModifier[]
  itemTotal: number
}

export interface OrderQueryParams {
  orderId: string
  phoneNumber: string
  items: OrderItem[]
  paymentAmount: number
  subtotal?: number
  currency?: string
  redirectUrl?: string
  redirectUrlError?: string
}

