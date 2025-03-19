
import { dispatch } from "./toast-reducer"
import { Toast, TOAST_DURATIONS, ToasterToast } from "./types"

// Counter for unique toast IDs
let count = 0

// Generate unique IDs for toasts
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

// Main toast function to create toasts
export function toast({ variant = "default", ...props }: Toast) {
  const id = genId()

  // Determine duration based on variant or use specified
  const duration = props.duration || TOAST_DURATIONS[variant as keyof typeof TOAST_DURATIONS] || TOAST_DURATIONS.default

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      variant,
      duration,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}
