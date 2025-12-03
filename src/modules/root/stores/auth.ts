import { ApiError } from '@/utils/api'
import { defineStore } from 'pinia'
import { computed, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const { notify } = useNotify()

// Message map for 2FA instruction
const messageMap: Record<
  string,
  { device: string; delivery: string; isRetryable: boolean }
> = {
  email: { device: 'inbox', delivery: 'e-mail', isRetryable: true },
  sms: { device: 'phone', delivery: 'SMS', isRetryable: true },
  totp: { device: 'authenticator app', delivery: 'secret', isRetryable: false },
}

// Auth State Type
interface AuthState {
  login: {
    email: string
    rememberMe: boolean
  }
  errors: {
    email?: string
    login?: string
    logout?: string
    forgotPassword?: string
    verify?: string
    verifyUnavailable?: string
    register?: string
    workspaceName?: string
    fullName?: string
  }
  verify: {
    uses2FA?: string
    sub?: string
    meta?: string
    code?: string
  }
  register: {
    workspaceName?: string
    fullName?: string
    email: string
  }
  submitting: boolean
}

const unexpectedErrorMessage = 'Ooops...! We hit a snag. Please contact support'

// Setup store
export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const route = useRoute()
  const ability = useAbility()

  // State
  const login = ref<AuthState['login']>({ email: '', rememberMe: false })
  const errors = ref<AuthState['errors']>({})
  const verify = ref<AuthState['verify']>({})
  const resending = ref(false)
  const passwordLogin = ref<{
    email: string
    password: string
    rememberMe: boolean
  }>({
    email: '',
    password: '',
    rememberMe: false,
  })
  const register = ref<AuthState['register']>({ email: '' })
  const forgotPassword = ref<{ email: string }>({ email: '' })
  const submitting = ref(false)

  // Watchers
  watchEffect(() => {
    if (!messageMap[verify.value.uses2FA ?? ''])
      errors.value.verifyUnavailable = unexpectedErrorMessage
    else errors.value.verifyUnavailable = undefined
  })

  // Computed properties
  const message = computed(() => {
    const msg = messageMap[verify.value.uses2FA ?? '']
    if (!msg) return { text: '', isRetryable: false }

    return {
      text: `We sent a verification code to your ${msg.device}. Enter the code from the ${msg.delivery} in the field below.`,
      isRetryable: msg.isRetryable,
    }
  })

  // Actions
  async function signin() {
    const { email } = login.value
    const res = await handleApiRequest(
      () => $api.post('/auth/signin', { email }),
      'login'
    )
    if (!res) return

    const { sub, uses2FA, meta, accessToken, userInfo } = res
    if (uses2FA) {
      set2FA({ sub, meta, uses2FA })
      return navigateTo('/verify', true)
    }

    await handleLoginSuccess({ accessToken, userInfo })

    return navigateTo(
      route.query.to ? String(route.query.to) : '/dashboards/analytics'
    )
  }

  async function signout() {
    const { email } = login.value
    await handleApiRequest(
      () => $api.post('/auth/signout', { email }),
      'logout'
    )

    useCookie('userInfo').value = null
    useCookie('accessToken').value = null
    useCookie('userPermissions').value = null
    ability.update([])

    return navigateTo('/login')
  }

  async function verify2FA() {
    const { sub, code } = verify.value

    if (!sub) {
      errors.value.verify =
        'Your verification session has expired. Please login again.'
      return
    }

    if (!code || code.trim().length !== 6) {
      errors.value.verify = 'Please enter the 6-digit verification code.'
      return
    }
    const res = await handleApiRequest(
      () => $api.post('/auth/signin/verify', { sub, code }),
      'verify'
    )
    if (!res) return
    notify({ message: 'Login successful', color: 'success' })
    const { accessToken, userInfo } = res

    await handleLoginSuccess({ accessToken, userInfo })

    return navigateTo(route.query.to ? String(route.query.to) : '/dashboard')
  }

  async function resend2FA() {
    const { sub } = verify.value

    if (!sub) {
      errors.value.verify =
        'Your verification session has expired. Please login again.'
      return
    }

    try {
      errors.value.verify = undefined
      resending.value = true
      await $api.post('/auth/signin/verify/resend', { sub })
    } catch (err) {
      if (err instanceof ApiError) {
        errors.value.verify = err.message
      } else {
        errors.value.verify = unexpectedErrorMessage
      }
    } finally {
      resending.value = false
    }
  }

  async function signinWithPassword() {
    const { email, password } = passwordLogin.value
    const res = await handleApiRequest(
      () => $api.post('/auth/signin', { email, password }),
      'login'
    )
    if (!res) return

    const { sub, uses2FA, meta, accessToken, userInfo } = res
    if (uses2FA) {
      set2FA({ sub, meta, uses2FA })

      return navigateTo('/verify', true)
    }

    await handleLoginSuccess({ accessToken, userInfo })

    return navigateTo(
      route.query.to ? String(route.query.to) : '/dashboards/analytics'
    )
  }

  async function signup() {
    const { workspaceName, fullName, email } = register.value
    const res = await handleApiRequest(
      () => $api.post('/auth/signup', { workspaceName, fullName, email }),
      'register'
    )
    if (!res) return

    const { sub, uses2FA, meta } = res
    if (uses2FA) {
      set2FA({ sub, meta, uses2FA })

      return navigateTo('/login/verify', true)
    }

    errors.value.register = unexpectedErrorMessage
  }

  async function reloadPage() {
    window.location.reload()
  }

  async function switchToWorkspace(workspaceId: string) {
    const res = await handleApiRequest(
      () => $api.post(`/auth/workspace/${workspaceId}/switch`),
      'workspaceName'
    )
    if (!res) return
    const { accessToken, userInfo } = res

    await updateSession({ accessToken, userInfo })

    navigateTo('/', true)
    reloadPage()
  }

  // Helpers
  async function handleApiRequest(
    apiCall: () => Promise<any>,
    errorField: keyof AuthState['errors']
  ) {
    try {
      resetErrors()
      submitting.value = true

      const res = await apiCall()

      submitting.value = false

      return res
    } catch (err) {
      submitting.value = false
      if (err instanceof ApiError) errors.value[errorField] = err.message
      else errors.value[errorField] = unexpectedErrorMessage
    }
  }

  async function navigateTo(
    path: string,
    preserveQueryParams = false,
    awaitNextTick: boolean = false
  ) {
    const payload = {
      path,
      query: preserveQueryParams ? { ...route.query } : undefined,
    }

    if (awaitNextTick) await nextTick()

    router.replace(payload)
  }

  async function updateSession({
    accessToken,
    userInfo,
  }: {
    accessToken?: string
    userInfo?: any
  }) {
    return new Promise<void>(resolve => {
      if (accessToken) useCookie('accessToken').value = accessToken

      useCookie('userInfo').value = userInfo
      // Fallback session id if backend doesn't provide one to avoid auth loops
      const fallbackSession =
        userInfo?.session ||
        `${Date.now()}-${Math.random().toString(36).slice(2)}`
      useCookie('_session').value = fallbackSession
      useCookie('userPermissions').value = userInfo.permissions
      ability.update(userInfo.permissions)
      resetErrors()

      nextTick().then(resolve)
    })
  }
  async function handleLoginSuccess({
    accessToken,
    userInfo,
  }: {
    accessToken?: string
    userInfo?: any
  }) {
    if (!userInfo?.permissions) {
      const errorMsg =
        "Your credentials won't allow access to the system. Contact support."

      errors.value.login = errorMsg
      errors.value.verify = errorMsg
    }

    await updateSession({ accessToken, userInfo })
  }

  function set2FA(data: { uses2FA: string; sub: string; meta: string }) {
    verify.value = data
  }

  function clear2FA() {
    verify.value = {}
  }

  function resetErrors() {
    errors.value = {}
  }

  return {
    login,
    passwordLogin,
    errors,
    submitting,
    verify,
    resending,
    register,
    forgotPassword,
    message,
    signup,
    signin,
    signinWithPassword,
    signout,
    verify2FA,
    resend2FA,
    set2FA,
    clear2FA,
    switchToWorkspace,
  }
})
