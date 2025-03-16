
import { Action, State, TOAST_REMOVE_DELAY, actionTypes } from "./types"

// Toast timeouts management
export const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Helper function to add toast to removal queue
export const addToRemoveQueue = (toastId: string, duration?: number) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  // Use custom duration or default
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: actionTypes.REMOVE_TOAST,
      toastId: toastId,
    })
  }, duration || TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

// State management
export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, state.toasts.length + 1),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action

      if (toastId) {
        const toast = state.toasts.find(t => t.id === toastId)
        addToRemoveQueue(toastId, toast?.duration)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id, toast.duration)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// Store listeners
export const listeners: Array<(state: State) => void> = []
export let memoryState: State = { toasts: [] }

// Dispatch function
export function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}
