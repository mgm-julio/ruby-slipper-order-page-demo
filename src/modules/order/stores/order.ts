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

  const initializeFromQueryParams = (params: OrderQueryParams | null): boolean => {
    if (!params) {
      return false
    }

    const hasValidData =
      params.orderId &&
      params.phoneNumber &&
      params.items &&
      params.items.length > 0 &&
      params.paymentAmount > 0

    if (!hasValidData) {
      return false
    }

    orderId.value = params.orderId
    phoneNumber.value = params.phoneNumber
    paymentAmount.value = params.paymentAmount
    items.value = params.items
    redirectUrl.value = params.redirectUrl || ''
    redirectUrlError.value = params.redirectUrlError || ''
    return true
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

      if (response) {
        redirectToCallback(true)
        return true
      }

      redirectToCallback(false)
      return false
    } catch {
      redirectToCallback(false)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const parseQueryParams = async (
    query: Record<string, any>
  ): Promise<OrderQueryParams | null> => {
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
      return null
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
    const externalUrl = success ? redirectUrl.value : redirectUrlError.value
    const defaultPath = success ? '/order/success' : '/order/error'

    let url = defaultPath

    if (externalUrl) {
      const isAbsoluteUrl =
        externalUrl.startsWith('http://') || externalUrl.startsWith('https://')

      if (isAbsoluteUrl) {
        try {
          const externalUrlObj = new URL(externalUrl)
          const currentOrigin = window.location.origin
          if (externalUrlObj.origin === currentOrigin) {
            const pathname = externalUrlObj.pathname
            if (pathname.startsWith('/order/')) {
              url = pathname
            }
          }
        } catch {
          url = defaultPath
        }
      } else if (externalUrl.startsWith('/order/')) {
        url = externalUrl
      }
    }

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
