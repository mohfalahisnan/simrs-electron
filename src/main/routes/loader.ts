import { IpcRouter } from '../ipc/router'
import { withSession, IpcMiddleware } from '../ipc/middleware'
import { SessionStore } from '../ipc/protected/session-store'

// Auto-register routes based on files in this directory.
// Convention: named exports that are functions become channels derived from the file path.
// Example: routes/user.ts with `export function list()` => channel `user:list`
// Nested files: routes/user/auth.ts with `export function login()` => channel `user:auth:login`
export function autoRegisterRoutes(router: IpcRouter, opts?: { sessionStore?: SessionStore }) {
  const modules = import.meta.glob('./**/*.ts', { eager: true }) as Record<string, any>

  for (const [filePath, mod] of Object.entries(modules)) {
    // Skip this loader file itself
    if (filePath.endsWith('/loader.ts')) continue

    const normalized = filePath
      .replace(/^\.\//, '')
      .replace(/\.(ts|js)$/i, '')
      .replace(/\\/g, '/')
    const base = normalized
      .split('/')
      .map((p) => p.replace(/^routes\//, ''))
      .filter(Boolean)
      .join(':')

    for (const [exportName, handler] of Object.entries(mod)) {
      if (typeof handler !== 'function') continue
      const channel = exportName === 'default' ? base : `${base}:${exportName}`
      try {
        // collect middlewares if provided by module
        const mws: IpcMiddleware<any, any, any>[] = []
        if (Array.isArray(mod.middlewares)) {
          mws.push(...(mod.middlewares as IpcMiddleware<any, any, any>[]))
        }
        if (opts?.sessionStore && mod.requireSession) {
          mws.push(withSession(opts.sessionStore))
        }
        router.register(channel, mws, handler as any)
        console.log(`[ipc] Registered auto route: ${channel}`)
      } catch (err) {
        console.warn(`[ipc] Failed to register route ${channel}:`, (err as Error).message)
      }
    }
  }
}