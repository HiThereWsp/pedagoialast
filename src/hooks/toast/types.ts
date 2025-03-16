
import { ReactNode } from "react";

export type ToastActionType = "ADD_TOAST" | "UPDATE_TOAST" | "DISMISS_TOAST" | "REMOVE_TOAST";

export type ToastProps = {
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  duration?: number;
};

export type Toast = ToastProps & {
  id?: string;
  open?: boolean;
};

export type ToasterToast = Required<Toast>;

export const TOAST_DURATIONS = {
  default: 5000,
  destructive: 8000,
  success: 3000,
  warning: 6000,
  info: 5000,
};
