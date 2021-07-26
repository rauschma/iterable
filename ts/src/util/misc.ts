export function isIterable(value: any): value is Iterable<any> {
  return Symbol.iterator in value;
}

export function* naturalNumbers() {
  for(let i=0;; i++) {
    yield i;
  }
}
