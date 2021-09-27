const list = {
  empty: () => (pattern) => pattern.empty(),
  cons: (value, list) => (pattern) => pattern.cons(value, list),
  match: (data, pattern) => data(pattern),
  toArray: (alist, accumulator) => {
    const toArrayHelper = (alist, accumulator) =>
      list.match(alist, {
        empty: () => accumulator,
        cons: (head, tail) => toArrayHelper(tail, accumulator.concat(head)),
      })
    return toArrayHelper(alist, [])
  },
}

/** map:: FUN[T => T] => LIST[T] => LIST[T] */
const map = (callback) => (alist) =>
  list.match(alist, {
    empty: () => list.empty(),
    cons: (head, tail) => list.cons(callback(head), map(callback)(tail)),
  })

const numbers = list.cons(1, list.cons(2, list.cons(3, list.empty())))
const mapDouble = map((n) => n * 2)
const compose = (f, g) => (arg) => f(g(arg))
test('map double', () => {
  expect(list.toArray(mapDouble(numbers))).toStrictEqual([2, 4, 6])
  expect(compose(list.toArray, mapDouble)(numbers)).toStrictEqual([2, 4, 6])
})

const mapSquare = map((n) => n * n)
test('map square', () => {
  expect(compose(list.toArray, mapSquare)(numbers)).toStrictEqual([1, 4, 9])
})
