//información básica de un usuario

import { ACCOUNT_TYPES } from "../constants/Rol";

export type AccountType = typeof ACCOUNT_TYPES[keyof typeof ACCOUNT_TYPES]

export interface User {
  id: string
  username: string
  email: string
  role: AccountType
  description: string
  avatarURL: string
}
