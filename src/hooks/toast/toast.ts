
import { TOAST_DURATIONS, Toast, ToasterToast } from "./types"
import { dispatch } from "./reducer"

// ID generator
let count = 0
export function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

// Toast creation function
export function toast({ variant = "default", ...props }: Toast) {
  const id = genId()

  // Get duration based on variant or use custom
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
