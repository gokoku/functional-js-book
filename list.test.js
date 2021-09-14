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
}

const isEmpty = (alist) =>
  list.match(alist, {
    empty: (_) => true,
    cons: (head, tail) => false,
  })
const map = (alist, transform) =>
  list.match(alist, {
    empty: () => empty(),
    cons: (head, tail) => cons(transform(head), map(tail, transform)),
  })

const toArray = (alist) => {
  const toArrayHelper = (alist, accumulator) =>
    list.match(alist, {
      empty: () => accumulator,
      cons: (head, tail) => toArrayHelper(tail, accumulator.concat(head)),
    })
  return toArrayHelper(alist, [])
}
const append = (xs, ys) =>
  list.match(xs, {
    empty: () => ys,
    cons: (head, tail) => list.cons(head, append(tail, ys)),
  })

const reverse = (alist) => {
  const reverseHelper = (alist, accumulator) =>
    list.match(alist, {
      empty: () => accumulator,
      cons: (head, tail) => reverseHelper(tail, list.cons(head, accumulator)),
    })
  return reverseHelper(alist, list.empty())
}
test('empty', () => {
  expect(isEmpty(list.empty())).toBe(true)
})
test('append', () => {
  expect(
    toArray(append(list.cons(1, list.empty()), list.cons(2, list.empty()))),
  ).toStrictEqual([1, 2])
})
test('reverse', () => {
  expect(
    toArray(reverse(list.cons(1, list.cons(2, list.empty())))),
  ).toStrictEqual([2, 1])
})

const compose = (f, g) => (arg) => f(g(arg))
const last = (alist) => compose(list.head, reverse)(alist)

test('last', () => {
  expect(last(list.cons(1, list.cons(2, list.cons(3, list.empty()))))).toBe(3)
})
