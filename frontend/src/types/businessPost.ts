import type { BusinessType } from "./AccountTypes";

export type BusinessPost = {
  id: string
  title: string
  type: BusinessType
  description: string
  hours: string
  contact: string
  location: string
  photos: string[]
  createdAt: string
}
