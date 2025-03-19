
import * as React from "react"
import { toast } from "./toast"
import { addListener, dispatch } from "./toast-reducer"
import { State } from "./types"

export function useToast() {
  const [state, setState] = React.useState<State>({ toasts: [] })

  React.useEffect(() => {
    const unsubscribe = addListener(setState)
    return unsubscribe
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { toast }
