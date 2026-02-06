import transmit from '@adonisjs/transmit/services/main'
import { Notification } from '@prisma/client'

export async function notifyUser(userId: number, payload: Notification) {
  const broadcastable = {
    ...payload,
    readAt: payload.readAt ? payload.readAt.toISOString() : null,
    createdAt: payload.createdAt ? payload.createdAt.toISOString() : null,
  }
  try {
    await transmit.broadcast(`user:${userId}`, broadcastable)
  } catch (err) {
    console.error('notifyUser error', err)
  }
}

export default { notifyUser }
