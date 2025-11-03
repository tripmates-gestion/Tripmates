import type { AccountType } from "./AccountTypes";

export interface CommonUsersInformation {
  id: string
  username: string
  email: string
  role: AccountType
  description: string
  avatarURL: string
}
