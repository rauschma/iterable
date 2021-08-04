# Helper functions for Iterables and AsyncIterables

## 1. Installation

```
npm install @rauschma/iterable
```

Usage from JavaScript and TypeScript:

```ts
// Synchronous API
import { Iterable } from '@rauschma/iterable/sync';
assert.deepEqual(
  Iterable.toArray(
    Iterable.map(x => x + x, ['a', 'b', 'c'])),
  ['aa', 'bb', 'cc']
);

// Asynchronous API
import { AsyncIterable } from '@rauschma/iterable/async';
  const fi = AsyncIterable.fromIterable;
  assert.deepEqual(
    await AsyncIterable.toArray(
      AsyncIterable.map(x => x + x, fi(['a', 'b', 'c']))),
    ['aa', 'bb', 'cc']
  );
```

## 2. Documentation

* [API documentation](http://rauschma.github.io/iterable/api/index.html) <span style="font-size: x-small">([local](api/index.html))</span>
* Unit tests: [sync](tree/main/ts/test/sync), [async](tree/main/ts/test/async)

## 3. Project setup

* I’m using the npm package [async-off](https://github.com/rauschma/async-off) to convert the async code (and its tests) to sync code.

## 4. FAQ

### Why export an object?

This prototypes what having two global built-in JavaScript namespace objects would look like:

* `Iterable` with `Iterable.map()` etc.
* `AsyncIterable` with `AsyncIterable.map()` etc.

### Why are iterables always trailing parameters?

If they are last, it’s easier to use partial application:

```js
const mapper = Iterable.map.bind(null, x => x);
```

Note that, should JavaScript ever get a pipe operator, the location of the data parameter wouldn’t matter much there:

```js
const result = ['a', 'b'] |> Iterable.map(x => x, ?);
```

### Why aren’t the helper functions curried?

* This API supports partial application: All functions in this library have the data as their last parameters.
* The library functions are not curried: JavaScript and its standard library are not designed for currying and clash with it in multiple ways ([more information](https://2ality.com/2017/11/currying-in-js.html#conflicts)). That’s why the functions are not curried.

### How were the functions picked?

This work is based on the TC39 proposal [“Iterator helpers”](https://github.com/tc39/proposal-iterator-helpers) by Gus Caplan, Michael Ficarra, Adam Vandolder, Jason Orendorff, Yulia Startsev.
