const list = {
  empty: () => (pattern) => pattern.empty(),
  cons: (value, list) => (pattern) => pattern.cons(value, list),

  match: (data, pattern) => data(pattern),
  head: (alist) =>
    list.match(alist, {
      empty: () => null,
      cons: (head, tail) => head,
    }),
  tail: (alist) =>
    list.match(alist, {
      empty: () => null,
      cons: (_, tail) => tail,
    }),
  toArray: (alist) => {
    const toArrayHelper = (alist, accumulator) =>
      list.match(alist, {
        empty: () => accumulator,
        cons: (head, tail) => toArrayHelper(tail, accumulator.concat(head)),
      })
    return toArrayHelper(alist, [])
  },
}
/*
test('list toArray', () => {
  expect(list.toArray(list.cons(1, list.cons(2, list.empty())))).toStrictEqual([
    1, 2,
  ])
})
 */
const stream = {
  match: (data, pattern) => data(pattern),
  empty: () => (pattern) => pattern.empty(),
  cons: (head, tailThunk) => (pattern) => pattern.cons(head, tailThunk),
  /* head::STREAM[T] => T */
  head: (aStream) =>
    stream.match(aStream, {
      empty: () => null,
      cons: (value, _) => value,
    }),
  /* tail::STREAM[T] => STREAM[T] */
  tail: (aStream) =>
    stream.match(aStream, {
      empty: () => null,
      cons: (_, tailThunk) => tailThunk(),
    }),
  /* take::(STREAM[T], NUM) => LIST[T] */
  take: (aStream, n) =>
    stream.match(aStream, {
      empty: () => list.empty(),
      cons: (head, tailThumk) => {
        if (n == 0) {
          return list.empty()
        } else {
          return list.cons(head, stream.take(tailThumk(), n - 1))
        }
        console.log(n)
      },
    }),
}

const ones = () => stream.cons(1, () => ones())

const enumFrom = (n) => stream.cons(n, () => enumFrom(n + 1))

const theStream = stream.cons(1, () => stream.cons(2, () => stream.empty()))
test('stream head', () => {
  expect(stream.head(theStream)).toBe(1)
})

test('stream take ones', () => {
  expect(list.toArray(stream.take(ones(), 5))).toStrictEqual([1, 1, 1, 1, 1])
})

test('stream take', () => {
  expect(list.toArray(stream.take(enumFrom(1), 5))).toStrictEqual([
    1, 2, 3, 4, 5,
  ])
})
