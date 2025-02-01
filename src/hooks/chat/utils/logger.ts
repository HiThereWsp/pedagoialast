export const logger = {
  debug: (msg: string) => console.log(`[DEBUG] ${new Date().toISOString()} - ${msg}`),
  error: (msg: string, err: any) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err)
}