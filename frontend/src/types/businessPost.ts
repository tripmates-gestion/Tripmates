import type { BusinessType } from "./businessType";

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
