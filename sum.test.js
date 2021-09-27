const list = {
  empty: () => (pattern) => pattern.empty(),
  cons: (value, list) => (pattern) => pattern.cons(value, list),
  match: (data, pattern) => data(pattern),
  head: (alist) =>
    list.match(alist, {
      empty: () => null,
      cons: (head, _) => head,
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
  sumWithCallback: (alist) => (accumulator) => (CALLBACK) =>
    list.match(alist, {
      empty: () => accumulator,
      cons: (head, tail) =>
        CALLBACK(head)(list.sumWithCallback(tail)(accumulator)(CALLBACK)),
    }),
  length: (alist) => (accumulator) =>
    list.match(alist, {
      empty: () => accumulator,
      cons: (_, tail) => list.length(tail)(accumulator + 1),
    }),
  lengthWithCallback: (alist) => (accumulator) => (CALLBACK) =>
    list.match(alist, {
      empty: () => accumulator,
      cons: (head, tail) =>
        CALLBACK(head)(list.lengthWithCallback(tail)(accumulator)(CALLBACK)),
    }),
  append: (xs) => (ys) =>
    list.match(xs, {
      empty: () => ys,
      cons: (head, tail) => list.cons(head, list.append(tail)(ys)),
    }),
  reverse: (alist) =>
    foldr(alist)(list.empty(0))(
      (item) => (accumulator) =>
        list.append(accumulator)(list.cons(item, list.empty())),
    ),
  find: (alist) => (predicate) =>
    foldr(alist)(null)((item) => (accumulator) => {
      if (predicate(item) === true) {
        return item
      } else {
        return accumulator
      }
    }),
}

const numbers = list.cons(1, list.cons(2, list.cons(3, list.empty())))

const callback1 = (n) => (m) => n + m

test('sum callback', () => {
  expect(list.sumWithCallback(numbers)(0)(callback1)).toBe(6)
})

test('length', () => {
  expect(list.length(numbers)(0)).toBe(3)
})

const callback2 = () => (m) => 1 + m

test('lengthWithCallback', () => {
  expect(list.lengthWithCallback(numbers)(0)(callback2)).toBe(3)
})

const foldr = (alist) => (accumulator) => (callback) =>
  list.match(alist, {
    empty: () => accumulator,
    cons: (head, tail) => callback(head)(foldr(tail)(accumulator)(callback)),
  })

const sum = (alist) =>
  foldr(alist)(0)((item) => (accumulator) => accumulator + item)
const length = (alist) =>
  foldr(alist)(0)(() => (accumulator) => accumulator + 1)

test('foldr sum length', () => {
  expect(sum(numbers)).toBe(6)
  expect(length(numbers)).toBe(3)
})

const compose = (f, g) => (arg) => f(g(arg))

test('append', () => {
  expect(list.toArray(list.append(numbers)(numbers))).toStrictEqual([
    1, 2, 3, 1, 2, 3,
  ])
})

test('reverse', () => {
  expect(compose(list.toArray, list.reverse)(numbers)).toStrictEqual([3, 2, 1])
})

test('find', () => {
  expect(list.find(numbers)((item) => item === 2)).toBe(2)
})
