
import { v4 as uuidv4 } from "uuid";
import { dispatch, actionTypes } from "./reducer";
import { TOAST_DURATIONS, Toast } from "./types";

/**
 * Toast function that can be used directly without the hook
 * This helps eliminate circular dependencies
 */
export const toast = ({ ...props }: Toast) => {
  const id = props.id || uuidv4();
  const variant = props.variant || "default";
  
  // Set duration based on variant or use default
  const duration = props.duration || TOAST_DURATIONS[variant] || TOAST_DURATIONS.default;

  // Dispatch the add toast action
  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      duration,
      open: true,
    },
  });

  return {
    id,
    dismiss: () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id }),
    update: (props: Toast) => 
      dispatch({
        type: actionTypes.UPDATE_TOAST,
        toast: { ...props, id },
      }),
  };
};
