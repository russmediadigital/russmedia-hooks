import {
  createHooks,
  addAction,
  addFilter,
  applyFilters,
  doAction,
} from './hooks'

describe('Testing the async hooks library', () => {
  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  beforeEach(() => {
    const hooks = createHooks()
    hooks.actions = {}
    hooks.filters = {}
  })

  test('createHooks creates a new instance', () => {
    const hooks = createHooks()
    hooks.addAction(`test`, () => { })
    expect(hooks.actions).toHaveProperty('test')
  })

  test('createHooks always return the singleton instance', () => {
    const hooks = createHooks()
    hooks.addAction(`test`, () => { })

    const otherHooks = createHooks()
    expect(otherHooks.actions).toHaveProperty('test')
  })

  test(`hooks priority setting is respected`, () => {
    const hooks = createHooks()
    hooks.addAction(`test`, () => { }, 1)
    hooks.addAction(`test`, () => { }, 3)
    hooks.addAction(`test`, () => { }, 2)

    expect(hooks.actions.test).toHaveLength(3)

    expect(hooks.actions.test[0].priority).toBe(1)
    expect(hooks.actions.test[1].priority).toBe(2)
    expect(hooks.actions.test[2].priority).toBe(3)
  })

  test(`hooks are executed in the correct order`, async () => {
    const a = []

    const hooks = createHooks()
    hooks.addAction(
      `test`,
      () => {
        a.push(1)
      },
      1
    )
    hooks.addAction(
      `test`,
      () => {
        a.push(3)
      },
      3
    )
    hooks.addAction(
      `test`,
      () => {
        a.push(2)
      },
      2
    )

    await hooks.doAction(`test`)
    expect(a).toEqual([1, 2, 3])
  })

  test(`Async methods are respected`, async () => {
    const a = []

    const hooks = createHooks()
    hooks.addAction(
      `test`,
      async () => {
        await timeout(50)
        a.push(2)
      },
      2
    )
    hooks.addAction(
      `test`,
      async () => {
        await timeout(100)
        a.push(1)
      },
      1
    )

    hooks.addAction(`afterAsyncOp`, () => a.push(3))

    await hooks.doAction(`test`)
    hooks.doAction(`afterAsyncOp`)
    expect(a).toEqual([1, 2, 3])
  })

  test(`args are passed correctly`, async () => {
    let r = ''
    const hooks = createHooks()
    hooks.addAction(
      `test`,
      (a, b) => {
        r = `${a}-${b}`
      },
      10
    )

    await hooks.doAction(`test`, 'A', 'B')
    expect(r).toEqual('A-B')
  })

  test(`filter hooks return the first arg as default`, async () => {
    const hooks = createHooks()

    const r = await hooks.applyFilters(`filter`, 'some value')
    expect(r).toBe(`some value`)
  })

  test(`filter hooks pipe value through`, async () => {
    const hooks = createHooks()
    hooks.addFilter(`filter`, (a) => `${a}1`)
    hooks.addFilter(`filter`, (a) => `${a}2`)
    hooks.addFilter(`filter`, (a) => `${a}3`)

    const r = await hooks.applyFilters(`filter`, `test`)
    expect(r).toBe(`test123`)
  })

  test(`filter hooks pass all arguments through`, async () => {
    const hooks = createHooks()
    hooks.addFilter(`filter`, (a, _b, _c) => `${a}1`)
    hooks.addFilter(`filter`, (a, b, c) => `${a}2-${b}-${c}`)

    const r = await hooks.applyFilters(`filter`, 'test', 'B', 'C')
    expect(r).toBe(`test12-B-C`)
  })

  test(`filter hooks are respect priorities`, async () => {
    const hooks = createHooks()
    hooks.addFilter(`filter`, () => `last run filter`, 20)
    hooks.addFilter(`filter`, () => `first run filter`)

    const r = await hooks.applyFilters(`filter`, `original value`)
    expect(r).toBe(`last run filter`)
  })

  test(`shorthand addAction works`, () => {
    addAction(`test`, () => { }, 10)
    expect(createHooks().actions.test).toHaveLength(1)
  })

  test(`shorthand doAction works`, () => {
    let c = ''
    addAction(
      `test`,
      () => {
        c = 'omgomg'
      },
      10
    )
    doAction(`test`)
    expect(c).toBe('omgomg')
  })

  test(`shorthand doAction works asynchronously`, async () => {
    let c = ''
    addAction(`test`, async () => {
      await timeout(200)
      c = 'omg omg after timeout'
    })
    await doAction(`test`)
    expect(c).toBe(`omg omg after timeout`)
  })

  test(`shorthand addFilter works`, () => {
    addFilter(`filter`, (a) => a)
    expect(createHooks().filters.filter).toHaveLength(1)
  })

  test(`shorthand applyFilters works`, async () => {
    addFilter(`filter`, (a) => `${a}1`)
    expect(await applyFilters(`filter`, `test`)).toBe(`test1`)
  })

  test(`shorthand applyFilters works asynchronously`, async () => {
    addFilter(`filter`, async () => {
      await timeout(200)
      return 'omg omg after timeout'
    })
    const c = await applyFilters(`filter`, `original value`)
    expect(c).toBe(`omg omg after timeout`)
  })
})
