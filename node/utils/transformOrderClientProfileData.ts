import type { ClientProfileDetail } from '@vtex/clients'
import type { ClientProfileData } from 'baranda.return-app-pmi'

export const transformOrderClientProfileData = (
  clientProfileData: ClientProfileDetail,
  email: string
): ClientProfileData => {
  return {
    name: `${clientProfileData.firstName} ${clientProfileData.lastName}`,
    email,
    phoneNumber: clientProfileData.phone,
  }
}
