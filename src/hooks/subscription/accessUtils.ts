
/**
 * Creates a timeout promise that rejects after specified milliseconds
 * @param milliseconds Time in milliseconds before rejection
 * @returns A promise that rejects after the specified time
 */
export const createTimeoutPromise = (milliseconds: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${milliseconds}ms`)), milliseconds);
  });
};

/**
 * Races a promise against a timeout
 * @param promise The primary promise to execute
 * @param timeoutMs Timeout in milliseconds
 * @param timeoutMessage Custom timeout message
 * @returns Result of the promise if it completes before timeout
 */
export const withTimeout = async <T>(
  promise: Promise<T>, 
  timeoutMs: number = 8000,
  timeoutMessage: string = "Operation timed out"
): Promise<T> => {
  const timeoutPromise = createTimeoutPromise(timeoutMs).catch(() => {
    throw new Error(timeoutMessage);
  });
  
  return Promise.race([promise, timeoutPromise]) as Promise<T>;
};
