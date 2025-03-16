
import * as React from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

// Toast constants
export const TOAST_LIMIT = 1
export const TOAST_REMOVE_DELAY = 5000

export const TOAST_DURATIONS = {
  default: 5000,
  success: 3000,
  destructive: 6000,
  info: 4000,
}

// Types
export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  duration?: number
}

export const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

export type ActionType = typeof actionTypes

export type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

export interface State {
  toasts: ToasterToast[]
}

export type Toast = Omit<ToasterToast, "id">
