# Helper functions for Iterables and AsyncIterables

## Design considerations

Should the iterable be the first parameter or the last parameter?

```js
['a', 'b'] |> map(x => x, ?)
const mapper = map.bind(null, x => x);
```

## FAQ

### Why export an object?

This prototypes what having two global built-in JavaScript namespace objects would look like:

* `Iterable` with `Iterable.map()` etc.
* `AsyncIterable` with `AsyncIterable.map()` etc.
