
import * as React from "react"
import { State } from "./types"
import { memoryState, dispatch, listeners } from "./reducer"
import { toast } from "./toast"

// useToast hook
export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    const handleChange = (newState: State) => {
      setState(newState)
    }

    // Add listener
    listeners.push(handleChange)
    
    return () => {
      // Remove listener on cleanup
      const index = listeners.indexOf(handleChange)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}
