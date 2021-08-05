# Helper functions for Iterables and AsyncIterables

Experimental code: If we had tool functions for Iterables and AsyncIterables in JavaScript’s standard library – what would they look like?

* **Caveat:** This repository is not in any way endorsed by TC39. It is just my own experiment, but I hope to eventually turn it into a proper proposal.

* Related work and foundation of this project: TC39 proposal [“Iterator helpers”](https://github.com/tc39/proposal-iterator-helpers) by Gus Caplan, Michael Ficarra, Adam Vandolder, Jason Orendorff, Yulia Startsev.

  * I prefer functions over adding methods to a class that all iterators have to extend. That’s why I created this repository: To prototype that approach.

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

### Tips

We can avoid qualifying (mentioning `Iterable` and `AsyncIterable`) via destructuring:

```ts
import { Iterable } from '@rauschma/iterable/sync';
const {toArray, map} = Iterable;

assert.deepEqual(
  toArray(
    map(x => x + x, ['a', 'b', 'c'])),
  ['aa', 'bb', 'cc']
);
```

Should JavaScript get [a pipeline operator](https://github.com/tc39/proposal-pipeline-operator), we can do:

```ts
['a', 'b', 'c']
|> map(x => x + x, ?)
|> toArray(?)
```

## 2. Documentation

* [API documentation](http://rauschma.github.io/iterable/api/index.html) <span style="font-size: x-small">([local](api/index.html))</span>
* Unit tests: [sync](https://github.com/rauschma/iterable/tree/main/ts/test/sync), [async](https://github.com/rauschma/iterable/tree/main/ts/test/async)

## 3. Project setup

* I’m using the npm package [async-off](https://github.com/rauschma/async-off) to convert the async code (and its tests) to sync code.

## 4. FAQ

### Why does each module export an object with functions and not individual functions?

This prototypes what having two global built-in JavaScript namespace objects would look like (think `JSON` and `Math`):

* `Iterable` with `Iterable.map()` etc.
* `AsyncIterable` with `AsyncIterable.map()` etc.

### Why yet another library for iterables?

The purpose of this package is not to be a library, it is to prototype built-in helpers for (async) iterables.

### How were the functions picked?

This work is based on the TC39 proposal [“Iterator helpers”](https://github.com/tc39/proposal-iterator-helpers) by Gus Caplan, Michael Ficarra, Adam Vandolder, Jason Orendorff, Yulia Startsev.

The one addition I made was `zip()`.

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

### Isn’t `Iterable.toArray()` the same as `Array.from()`?

Yes, `Array.from()` does what `Iterable.toArray()` does (and more). The latter function only exists because there is `AsyncIterable.toArray()` (which has no current equivalent in JavaScript’s standard library).
