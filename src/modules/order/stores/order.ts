import { $api } from '@/utils/api'
import type { CheckoutData } from '@/views/wizard-examples/checkout/types'
import customPayment from '@images/svg/payment.svg'
import customTrending from '@images/svg/trending.svg'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type {
  OrderItem,
  OrderItemModifier,
  OrderQueryParams,
} from '../types/order.types'

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

const getMockData = (): OrderQueryParams => {
  const item1BasePrice = 12.99
  const item1Modifiers = [
    { name: 'Extra Cheese', priceAdjustment: 1.5 },
    { name: 'Pepperoni', priceAdjustment: 0.75 },
  ]
  const item1Price =
    item1BasePrice +
    item1Modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)
  const item1Quantity = 2
  const item1Total = item1Price * item1Quantity

  const item2BasePrice = 3.99
  const item2Modifiers: OrderItemModifier[] = []
  const item2Price = item2BasePrice
  const item2Quantity = 1
  const item2Total = item2Price * item2Quantity

  const item3BasePrice = 8.99
  const item3Modifiers = [{ name: 'Garlic Bread', priceAdjustment: 1.0 }]
  const item3Price =
    item3BasePrice +
    item3Modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)
  const item3Quantity = 3
  const item3Total = item3Price * item3Quantity

  const item4BasePrice = 5.99
  const item4Modifiers: OrderItemModifier[] = []
  const item4Price = item4BasePrice
  const item4Quantity = 2
  const item4Total = item4Price * item4Quantity

  const item5BasePrice = 15.99
  const item5Modifiers = [
    { name: 'Mushrooms', priceAdjustment: 1.25 },
    { name: 'Olives', priceAdjustment: 0.5 },
  ]
  const item5Price =
    item5BasePrice +
    item5Modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)
  const item5Quantity = 1
  const item5Total = item5Price * item5Quantity

  const item6BasePrice = 9.99
  const item6Modifiers = [{ name: 'Extra Sauce', priceAdjustment: 0.5 }]
  const item6Price =
    item6BasePrice +
    item6Modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)
  const item6Quantity = 2
  const item6Total = item6Price * item6Quantity

  const item7BasePrice = 6.99
  const item7Modifiers: OrderItemModifier[] = []
  const item7Price = item7BasePrice
  const item7Quantity = 3
  const item7Total = item7Price * item7Quantity

  const item8BasePrice = 11.99
  const item8Modifiers = [
    { name: 'Bacon', priceAdjustment: 2.0 },
    { name: 'Extra Cheese', priceAdjustment: 1.5 },
  ]
  const item8Price =
    item8BasePrice +
    item8Modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)
  const item8Quantity = 1
  const item8Total = item8Price * item8Quantity

  const item9BasePrice = 4.99
  const item9Modifiers: OrderItemModifier[] = []
  const item9Price = item9BasePrice
  const item9Quantity = 4
  const item9Total = item9Price * item9Quantity

  const item10BasePrice = 18.99
  const item10Modifiers = [
    { name: 'Pepperoni', priceAdjustment: 1.0 },
    { name: 'Sausage', priceAdjustment: 1.5 },
    { name: 'Mushrooms', priceAdjustment: 1.25 },
  ]
  const item10Price =
    item10BasePrice +
    item10Modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)
  const item10Quantity = 1
  const item10Total = item10Price * item10Quantity

  const item11BasePrice = 10.99
  const item11Modifiers = [{ name: 'Extra Sauce', priceAdjustment: 0.75 }]
  const item11Price =
    item11BasePrice +
    item11Modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)
  const item11Quantity = 2
  const item11Total = item11Price * item11Quantity

  const item12BasePrice = 4.5
  const item12Modifiers: OrderItemModifier[] = []
  const item12Price = item12BasePrice
  const item12Quantity = 3
  const item12Total = item12Price * item12Quantity

  const item13BasePrice = 7.99
  const item13Modifiers = [{ name: 'Marinara Sauce', priceAdjustment: 0.5 }]
  const item13Price =
    item13BasePrice +
    item13Modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)
  const item13Quantity = 2
  const item13Total = item13Price * item13Quantity

  const item14BasePrice = 22.99
  const item14Modifiers = [
    { name: 'Extra BBQ Sauce', priceAdjustment: 1.0 },
    { name: 'Coleslaw', priceAdjustment: 2.0 },
  ]
  const item14Price =
    item14BasePrice +
    item14Modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)
  const item14Quantity = 1
  const item14Total = item14Price * item14Quantity

  const item15BasePrice = 13.99
  const item15Modifiers = [{ name: 'Tartar Sauce', priceAdjustment: 0.5 }]
  const item15Price =
    item15BasePrice +
    item15Modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)
  const item15Quantity = 2
  const item15Total = item15Price * item15Quantity

  const subtotal =
    item1Total +
    item2Total +
    item3Total +
    item4Total +
    item5Total +
    item6Total +
    item7Total +
    item8Total +
    item9Total +
    item10Total +
    item11Total +
    item12Total +
    item13Total +
    item14Total +
    item15Total

  return {
    orderId: 'f6c1f82f-8956-4bc4-a800-a8d505820a33',
    phoneNumber: '+1 (555) 123-4567',
    items: [
      {
        itemId: generateUUID(),
        name: 'Pepperoni Pizza (Medium)',
        quantity: item1Quantity,
        basePrice: item1BasePrice,
        modifiers: item1Modifiers,
        itemTotal: item1Total,
      },
      {
        itemId: generateUUID(),
        name: 'Coca Cola (Large)',
        quantity: item2Quantity,
        basePrice: item2BasePrice,
        modifiers: item2Modifiers,
        itemTotal: item2Total,
      },
      {
        itemId: generateUUID(),
        name: 'Caesar Salad (Family Size)',
        quantity: item3Quantity,
        basePrice: item3BasePrice,
        modifiers: item3Modifiers,
        itemTotal: item3Total,
      },
      {
        itemId: generateUUID(),
        name: 'Chocolate Brownie',
        quantity: item4Quantity,
        basePrice: item4BasePrice,
        modifiers: item4Modifiers,
        itemTotal: item4Total,
      },
      {
        itemId: generateUUID(),
        name: 'Margherita Pizza (Large)',
        quantity: item5Quantity,
        basePrice: item5BasePrice,
        modifiers: item5Modifiers,
        itemTotal: item5Total,
      },
      {
        itemId: generateUUID(),
        name: 'Buffalo Wings (12 pieces)',
        quantity: item6Quantity,
        basePrice: item6BasePrice,
        modifiers: item6Modifiers,
        itemTotal: item6Total,
      },
      {
        itemId: generateUUID(),
        name: 'Garlic Breadsticks',
        quantity: item7Quantity,
        basePrice: item7BasePrice,
        modifiers: item7Modifiers,
        itemTotal: item7Total,
      },
      {
        itemId: generateUUID(),
        name: 'Supreme Burger',
        quantity: item8Quantity,
        basePrice: item8BasePrice,
        modifiers: item8Modifiers,
        itemTotal: item8Total,
      },
      {
        itemId: generateUUID(),
        name: 'French Fries (Large)',
        quantity: item9Quantity,
        basePrice: item9BasePrice,
        modifiers: item9Modifiers,
        itemTotal: item9Total,
      },
      {
        itemId: generateUUID(),
        name: 'Supreme Pizza (Extra Large)',
        quantity: item10Quantity,
        basePrice: item10BasePrice,
        modifiers: item10Modifiers,
        itemTotal: item10Total,
      },
      {
        itemId: generateUUID(),
        name: 'Chicken Tenders (8 pieces)',
        quantity: item11Quantity,
        basePrice: item11BasePrice,
        modifiers: item11Modifiers,
        itemTotal: item11Total,
      },
      {
        itemId: generateUUID(),
        name: 'Onion Rings (Large)',
        quantity: item12Quantity,
        basePrice: item12BasePrice,
        modifiers: item12Modifiers,
        itemTotal: item12Total,
      },
      {
        itemId: generateUUID(),
        name: 'Mozzarella Sticks (6 pieces)',
        quantity: item13Quantity,
        basePrice: item13BasePrice,
        modifiers: item13Modifiers,
        itemTotal: item13Total,
      },
      {
        itemId: generateUUID(),
        name: 'BBQ Ribs (Full Rack)',
        quantity: item14Quantity,
        basePrice: item14BasePrice,
        modifiers: item14Modifiers,
        itemTotal: item14Total,
      },
      {
        itemId: generateUUID(),
        name: 'Fish & Chips',
        quantity: item15Quantity,
        basePrice: item15BasePrice,
        modifiers: item15Modifiers,
        itemTotal: item15Total,
      },
    ],
    paymentAmount: subtotal,
    subtotal,
    currency: 'USD',
    redirectUrl: 'https://agentic.io/payment/success',
    redirectUrlError: 'https://agentic.io/payment/error',
  }
}

export const useOrderStore = defineStore('order', () => {
  const orderId = ref<string>('')
  const phoneNumber = ref<string>('')
  const paymentAmount = ref<number>(0)
  const items = ref<OrderItem[]>([])
  const currentStep = ref<number>(0)
  const orderNotes = ref<string>('')
  const redirectUrl = ref<string>('')
  const redirectUrlError = ref<string>('')
  const isLoading = ref<boolean>(false)

  const checkoutSteps = computed(() => [
    {
      title: 'Payment',
      icon: customPayment,
    },
    {
      title: 'Confirmation',
      icon: customTrending,
    },
  ])

  const checkoutData = computed<CheckoutData>(() => {
    const cartItems = items.value.map((item, index) => ({
      id: index + 1,
      name: item.name,
      seller: 'Restaurant',
      inStock: true,
      rating: 5,
      price: item.itemTotal / item.quantity,
      discountPrice: item.itemTotal / item.quantity,
      image: 'https://via.placeholder.com/140',
      quantity: item.quantity,
      estimatedDelivery: 'ASAP',
    }))

    return {
      cartItems,
      promoCode: '',
      orderAmount: paymentAmount.value,
      deliveryAddress: 'home',
      deliverySpeed: 'free',
      deliveryCharges: 0,
      addresses: [
        {
          title: `Phone: ${phoneNumber.value}`,
          desc: 'Delivery address',
          subtitle: phoneNumber.value,
          value: 'home',
        },
      ],
      orderNotes: orderNotes.value,
    }
  })

  const initializeFromQueryParams = (params: OrderQueryParams) => {
    const hasValidData =
      params.orderId &&
      params.phoneNumber &&
      params.items &&
      params.items.length > 0 &&
      params.paymentAmount > 0

    if (!hasValidData) {
      const mockData = getMockData()
      orderId.value = mockData.orderId
      phoneNumber.value = mockData.phoneNumber
      paymentAmount.value = mockData.paymentAmount
      items.value = mockData.items
      redirectUrl.value = mockData.redirectUrl || ''
      redirectUrlError.value = mockData.redirectUrlError || ''
      return
    }

    orderId.value = params.orderId
    phoneNumber.value = params.phoneNumber
    paymentAmount.value = params.paymentAmount
    items.value = params.items
    redirectUrl.value = params.redirectUrl || ''
    redirectUrlError.value = params.redirectUrlError || ''
  }

  const fetchOrderFromBackend = async (
    orderIdParam: string,
    redirectUrlParam?: string,
    redirectUrlErrorParam?: string
  ): Promise<OrderQueryParams | null> => {
    if (!orderIdParam) {
      return null
    }

    try {
      isLoading.value = true
      const response = await $api.get(`/orders/${orderIdParam}`)

      if (
        response &&
        response.orderId &&
        response.phoneNumber &&
        response.items &&
        Array.isArray(response.items) &&
        response.items.length > 0 &&
        response.total > 0
      ) {
        return {
          orderId: response.orderId,
          phoneNumber: response.phoneNumber,
          items: response.items,
          paymentAmount: response.total,
          subtotal: response.subtotal || response.total,
          currency: response.currency || 'USD',
          redirectUrl: redirectUrlParam || '',
          redirectUrlError: redirectUrlErrorParam || '',
        }
      }

      return null
    } catch {
      return null
    } finally {
      isLoading.value = false
    }
  }

  const processPayment = async (): Promise<boolean> => {
    if (!orderId.value) {
      return false
    }

    try {
      isLoading.value = true
      const response = await $api.post(`/orders/${orderId.value}/pay`)

      if (response && response.status === 'completed') {
        return true
      }

      return false
    } catch {
      return false
    } finally {
      isLoading.value = false
    }
  }

  const parseQueryParams = async (
    query: Record<string, any>
  ): Promise<OrderQueryParams> => {
    const queryOrderId = (query.orderId as string) || ''
    const redirectUrl = (query.redirectUrl as string) || ''
    const redirectUrlError = (query.redirectUrlError as string) || ''

    if (queryOrderId) {
      const backendData = await fetchOrderFromBackend(
        queryOrderId,
        redirectUrl,
        redirectUrlError
      )
      if (backendData) {
        return backendData
      }
    }

    const parsedItems: OrderItem[] = []

    if (query.items) {
      try {
        const itemsParam = query.items as string
        const decoded = decodeURIComponent(itemsParam)
        const parsed = JSON.parse(decoded)
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsedItems.push(...parsed)
        }
      } catch {
        parsedItems.push(...[])
      }
    }

    const orderId = queryOrderId
    const phoneNumber = (query.phoneNumber as string) || ''
    const paymentAmount = query.paymentAmount
      ? parseFloat(query.paymentAmount as string)
      : 0

    const hasValidParams =
      orderId && phoneNumber && parsedItems.length > 0 && paymentAmount > 0

    if (!hasValidParams) {
      return getMockData()
    }

    return {
      orderId,
      phoneNumber,
      items: parsedItems,
      paymentAmount,
      redirectUrl,
      redirectUrlError,
    }
  }

  const redirectToCallback = (success: boolean) => {
    const url = success ? redirectUrl.value : redirectUrlError.value
    if (url) {
      try {
        const callbackUrl = new URL(url, window.location.origin)
        callbackUrl.searchParams.set('orderId', orderId.value)
        callbackUrl.searchParams.set('status', success ? 'success' : 'error')
        callbackUrl.searchParams.set(
          'paymentAmount',
          paymentAmount.value.toString()
        )
        if (orderNotes.value) {
          callbackUrl.searchParams.set(
            'notes',
            encodeURIComponent(orderNotes.value)
          )
        }
        window.location.href = callbackUrl.toString()
      } catch {
        const separator = url.includes('?') ? '&' : '?'
        const params = new URLSearchParams()
        params.set('orderId', orderId.value)
        params.set('status', success ? 'success' : 'error')
        params.set('paymentAmount', paymentAmount.value.toString())
        if (orderNotes.value) {
          params.set('notes', encodeURIComponent(orderNotes.value))
        }
        window.location.href = `${url}${separator}${params.toString()}`
      }
    }
  }

  const hasValidOrderId = computed(() => {
    return !!orderId.value && items.value.length > 0 && paymentAmount.value > 0
  })

  return {
    orderId,
    phoneNumber,
    paymentAmount,
    items,
    currentStep,
    orderNotes,
    redirectUrl,
    redirectUrlError,
    isLoading,
    checkoutSteps,
    checkoutData,
    hasValidOrderId,
    initializeFromQueryParams,
    parseQueryParams,
    redirectToCallback,
    fetchOrderFromBackend,
    processPayment,
  }
})
