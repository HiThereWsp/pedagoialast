
import { toast as internalToast } from "./reducer"

/**
 * Toast function that can be used directly without the hook
 * This helps eliminate circular dependencies
 */
export const toast = internalToast
