export interface TwilioAccount {
  id: string
  accountSid: string
  friendlyName: string
  status: 'verified' | 'unverified' | 'pending'
  brandSid?: string
  campaignSid?: string
  createdAt: string
}

export interface BrandData {
  friendlyName: string
  companyName: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  email: string
  phone: string
  website: string
  vertical: string
  ein: string
}

export interface CampaignData {
  brandSid: string
  usecase: string
  description: string
  sampleMessage1: string
  sampleMessage2: string
  messagingService: string
  usAppToPerson: boolean
  hasEmbeddedLinks: boolean
  hasEmbeddedPhone: boolean
  hasDirectLending: boolean
  ageGated: boolean
  consentDescription: string
  optInKeywords: string
  optInMessage: string
  subscriberOptIn: boolean
  subscriberOptOut: boolean
  subscriberHelp: boolean
}

export interface WizardStep {
  title: string
  subtitle: string
  component: any
  options?: any
}
