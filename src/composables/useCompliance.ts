import { useNotify } from '@/composables/useNotify'
import { $api } from '@/utils/api'
import { computed, ref } from 'vue'

interface ComplianceStatus {
  isVerified: boolean
  hasBrand: boolean
  hasCampaign: boolean
  status: 'verified' | 'unverified' | 'pending'
  message?: string

}

export function useCompliance() {
  const { notify } = useNotify()
  const complianceStatus = ref<ComplianceStatus>({
    isVerified: false,
    hasBrand: false,
    hasCampaign: false,
    status: 'unverified'
  })
  const loading = ref(false)

  const canSendMessages = computed(() => {
    return complianceStatus.value.isVerified && 
           complianceStatus.value.hasBrand && 
           complianceStatus.value.hasCampaign
  })

  const checkComplianceStatus = async () => {
    loading.value = true
    try {
      const response = await $api('/twilio-compliance/accounts', { method: 'GET' })
      const accounts = response || []
      
      if (accounts.length === 0) {
        complianceStatus.value = {
          isVerified: false,
          hasBrand: false,
          hasCampaign: false,
          status: 'unverified',
          message: 'No hay cuentas de Twilio configuradas'
        }
        return
      }

      const account = accounts[0]
      complianceStatus.value = {
        isVerified: account.status === 'verified',
        hasBrand: !!account.brandSid,
        hasCampaign: !!account.campaignSid,
        status: account.status,
        message: getComplianceMessage(account.status)
      }
    } catch (error) {
      complianceStatus.value = {
        isVerified: false,
        hasBrand: false,
        hasCampaign: false,
        status: 'unverified',
        message: 'Error al verificar el estado de compliance'
      }
    } finally {
      loading.value = false
    }
  }

  const getComplianceMessage = (status: string): string => {
    switch (status) {
      case 'verified':
        return 'Su cuenta está verificada y puede enviar mensajes'
      case 'pending':
        return 'Su cuenta está en proceso de verificación. Los mensajes pueden estar limitados'
      case 'unverified':
        return 'Su cuenta no está verificada. Debe completar el proceso A2P 10DLC para enviar mensajes'
      default:
        return 'Estado de compliance desconocido'
    }
  }

  const validateBeforeSending = (): boolean => {
    if (!canSendMessages.value) {
      const message = complianceStatus.value.message || 'No puede enviar mensajes sin compliance A2P 10DLC'
      notify({
        message,
        color: 'warning'
      })
      return false
    }
    return true
  }

  const showComplianceWarning = () => {
    if (!canSendMessages.value) {
      notify({
        message: 'Debe completar la verificación A2P 10DLC antes de enviar mensajes',
        color: 'warning'
      })
    }
  }

  return {
    complianceStatus,
    loading,
    canSendMessages,
    checkComplianceStatus,
    validateBeforeSending,
    showComplianceWarning
  }
}
