export const retryOperation = async <T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError: any
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
        continue
      }
    }
  }
  throw lastError
}