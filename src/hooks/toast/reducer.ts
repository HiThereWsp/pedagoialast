
import { v4 as uuidv4 } from "uuid";
import { Toast, ToasterToast, ToastActionType } from "./types";

// Define Action Types
export const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

type Action =
  | { type: typeof actionTypes.ADD_TOAST; toast: Toast }
  | { type: typeof actionTypes.UPDATE_TOAST; toast: Partial<Toast> }
  | { type: typeof actionTypes.DISMISS_TOAST; toastId: string }
  | { type: typeof actionTypes.REMOVE_TOAST; toastId: string };

interface State {
  toasts: ToasterToast[];
}

export const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const memoryState: State = { toasts: [] };

export function dispatch(action: Action) {
  memoryState.toasts = reducer(memoryState.toasts, action);
}

export function reducer(state: ToasterToast[], action: Action): ToasterToast[] {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return [
        ...state,
        { ...action.toast, id: action.toast.id || uuidv4(), open: true },
      ];

    case actionTypes.UPDATE_TOAST:
      return state.map((t) =>
        t.id === action.toast.id ? { ...t, ...action.toast } : t
      );

    case actionTypes.DISMISS_TOAST:
      return state.map((t) =>
        t.id === action.toastId ? { ...t, open: false } : t
      );

    case actionTypes.REMOVE_TOAST:
      return state.filter((t) => t.id !== action.toastId);

    default:
      return state;
  }
}

export function getToasts() {
  return memoryState.toasts;
}
