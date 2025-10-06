import { withError } from '../ipc/middleware'
import { User } from '../models/user'

// Middlewares to apply to all handlers in this file
export const middlewares = [withError]
export const requireSession = true

export async function list() {
  return await User.findAll({ raw: true })
}

export async function get(id: number) {
  return await User.findByPk(id, { raw: true })
}

export async function create(data: any) {
  const u = await User.create(data)
  return u.get({ plain: true })
}
