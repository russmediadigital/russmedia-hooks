# Russmedia Hooks

A lightweight & efficient EventManager for JavaScript mimicing the functionality of [@wordpress/hooks](https://github.com/WordPress/gutenberg/tree/master/packages/hooks), but with the ability to await async actions/filters to be finished before proceeding.

## Installation

Install the module

```bash
npm install russmedia-hooks --save
```

_This package assumes that your code will run in an **ES2015+** environment. If you're using an environment that has limited or no support for ES2015+ such as lower versions of IE then using [core-js](https://github.com/zloirock/core-js) or [@babel/polyfill](https://babeljs.io/docs/en/next/babel-polyfill) will add support for these methods. Learn more about it in [Babel docs](https://babeljs.io/docs/en/next/caveats)._

### Usage

In your Javascript project, use russmedia-hooks as follows:

```javascript
import { createHooks } from 'russmedia-hooks'

const hooks = createHooks()
hooks.addAction(...)
await hooks.doAction(...)
...
```

You may also use the shorthand versions.

```javascript
import { addAction, doAction } from 'russmedia-hooks'

addAction(...)
await doAction(...)
...
```

The basic functionality is similar to how [WordPress handles hooks](https://developer.wordpress.org/plugins/hooks/).

### API Usage

* `createHooks()`
* `addAction( 'hookName', callback, priority )`
* `addFilter( 'hookName', callback, priority )`
* `doAction( 'hookName', arg1, arg2, moreArgs, finalArg )`
* `applyFilters( 'hookName', content, arg1, arg2, moreArgs, finalArg )`
* `actions`
* `filters`

See hooks.spec.ts for basic examples on how to set up and trigger actions/filters.