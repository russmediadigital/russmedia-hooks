interface SingleHook {
  callback: (...args: any[]) => any
  priority: number
}

interface Hook {
  [name: string]: SingleHook[]
}

class Hooks {
  private static instance: Hooks

  public actions: Hook = {}
  public filters: Hook = {}

  static getInstance() {
    if (!this.instance) this.instance = new Hooks()
    return this.instance
  }

  private addHook(
    list: Hook,
    name: string,
    callback: (...args: any[]) => any,
    priority: number = 10
  ): void {
    if (!this.validateHookName(name)) return
    if (typeof callback !== 'function') return
    if (typeof priority !== 'number') return
    const handler: SingleHook = { callback, priority }

    if (list[name]) {
      const handlers = [...list[name], handler]
      handlers.sort((a, b) => a.priority - b.priority)
      list[name] = handlers
    } else {
      list[name] = [handler]
    }
  }

  addAction(
    name: string,
    callback: (...args: any[]) => void,
    priority: number = 10
  ): void {
    this.addHook(this.actions, name, callback, priority)
  }

  addFilter(
    name: string,
    callback: (...args: any[]) => any,
    priority: number = 10
  ): void {
    this.addHook(this.filters, name, callback, priority)
  }

  private async doHook(
    list: Hook,
    name: string,
    withReturn: boolean,
    ...args: any[]
  ) {
    if (list[name]) {
      for (let i = 0; i < list[name].length; i++) {
        const handler = list[name][i]

        // @ts-ignore Expected 1-2 arguments, but got 1 or more
        const ret = await handler.callback.apply(null, ...args)
        if (withReturn) {
          args[0][0] = ret
        }
      }
    }

    if (withReturn) return args[0][0]
  }

  async doAction(name: string, ...args: any[]) {
    await this.doHook(this.actions, name, false, args)
  }

  async applyFilters(name: string, ...args: any[]) {
    return await this.doHook(this.filters, name, true, args)
  }

  private validateHookName(name: string): boolean {
    if (typeof name !== 'string' || name.trim().length === 0) {
      console.error(`The hook name must be a non empty string`)
      return false
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_./-]*$/.test(name)) {
      console.error(
        `The hook name ${name} can only contain numbers, letters, dashes, periods, underscores and slashes.`
      )
      return false
    }
    return true
  }
}

export function createHooks(): Hooks {
  return Hooks.getInstance()
}

export function addFilter(
  name: string,
  callback: (...args: any[]) => any,
  priority: number = 10
): void {
  const hooks = createHooks()
  hooks.addFilter(name, callback, priority)
}
export function addAction(
  name: string,
  callback: (...args: any[]) => any,
  priority: number = 10
): void {
  createHooks().addAction(name, callback, priority)
}

export async function applyFilters(name: string, ...args: any[]) {
  return await createHooks().applyFilters(name, ...args)
}

export async function doAction(name: string, ...args: any[]) {
  await createHooks().doAction(name, ...args)
}
