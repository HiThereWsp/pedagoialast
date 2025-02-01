export class ChatError extends Error {
  constructor(message: string, public context: object) {
    super(message)
    this.name = 'ChatError'
  }
}