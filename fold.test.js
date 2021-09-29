const list = {
  empty: () => (pattern) => pattern.empty(),
  cons: (value, list) => (pattern) => pattern.cons(value, list),
  match: (data, pattern) => data(pattern),
  sum: (alist) => (accumulator) =>
    list.match(alist, {
      empty: () => accumulator,
      cons: (head, tail) => list.sum(tail)(accumulator + head),
    }),
  toArray: (alist, accumulator) => {
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
  /** sumWithCallback も lengthWithCallback も同じ形になる。これが畳み込み関数 */
  foldr: (alist) => (accumulator) => (callback) =>
    list.match(alist, {
      empty: () => accumulator,
      cons: (head, tail) =>
        callback(head)(list.foldr(tail)(accumulator)(callback)),
    }),
  append: (xs) => (ys) =>
    list.match(xs, {
      empty: () => ys,
      cons: (head, tail) => list.cons(head, list.append(tail)(ys)),
    }),
  reverse: (alist) =>
    list.foldr(alist)(list.empty(0))(
      (item) => (accumulator) =>
        list.append(accumulator)(list.cons(item, list.empty())),
    ),
  find: (alist) => (predicate) =>
    list.foldr(alist)(null)((item) => (accumulator) => {
      if (predicate(item) === true) {
        return item
      } else {
        return accumulator
      }
    }),
}

const numbers = list.cons(1, list.cons(2, list.cons(3, list.empty())))

test('sum', () => {
  expect(list.sum(numbers)(0)).toBe(6)
})

const callback = (n) => (m) => n + m
test('sum with callback', () => {
  expect(list.sumWithCallback(numbers)(0)(callback)).toBe(6)
})

test('length', () => {
  expect(list.length(numbers)(0)).toBe(3)
})

const callback2 = () => (m) => 1 + m
test('length with callback', () => {
  expect(list.lengthWithCallback(numbers)(0)(callback2)).toBe(3)
})

const sum = (alist) =>
  list.foldr(alist)(0)((item) => (accumulator) => accumulator + item)

test('sum with foldr', () => {
  expect(sum(numbers)).toBe(6)
})

const length = (alist) =>
  list.foldr(alist)(0)(() => (accumulator) => accumulator + 1)
test('length with foldr', () => {
  expect(length(numbers)).toBe(3)
})

const product = (alist) =>
  list.foldr(alist)(1)((item) => (accumulator) => accumulator * item)
test('product with foldr', () => {
  expect(product(numbers)).toBe(6)
})

boolAllTrue = list.cons(true, list.cons(true, list.cons(true, list.empty())))
boolOnlyOneFalse = list.cons(
  true,
  list.cons(false, list.cons(true, list.empty())),
)
boolAllFalse = list.cons(
  false,
  list.cons(false, list.cons(false, list.empty())),
)
const all = (alist) =>
  list.foldr(alist)(true)((item) => (accumulator) => accumulator && item)

test('all with foldr', () => {
  expect(all(boolAllTrue)).toBe(true)
  expect(all(boolOnlyOneFalse)).toBe(false)
  expect(all(boolAllFalse)).toBe(false)
})

const any = (alist) =>
  list.foldr(alist)(false)((item) => (accumulator) => accumulator || item)

test('any with foldr', () => {
  expect(any(boolAllTrue)).toBe(true)
  expect(any(boolOnlyOneFalse)).toBe(true)
  expect(any(boolAllFalse)).toBe(false)
})

const compose = (f, g) => (arg) => f(g(arg))

test('append', () => {
  expect(
    compose(
      list.toArray,
      list.append(numbers),
    )(list.cons(4, list.cons(5, list.empty()))),
  ).toStrictEqual([1, 2, 3, 4, 5])
})

test('reverse', () => {
  expect(compose(list.toArray, list.reverse)(numbers)).toStrictEqual([3, 2, 1])
})

test('find', () => {
  expect(list.find(numbers)((item) => item >= 2)).toBe(2)
  expect(list.find(numbers)((item) => item > 2)).toBe(3)
})
