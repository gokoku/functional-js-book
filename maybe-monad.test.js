const list = {
  empty: () => (pattern) => pattern.empty(),
  cons: (value, list) => (pattern) => pattern.cons(value, list),
  match: (data, pattern) => data(pattern),
}

const head = (alist) =>
  FileList.match(alist, {
    empty: () => null,
    cons: (head, _) => head,
  })

const maybe = {
  match: (exp, pattern) => exp.call(pattern, pattern),
  just: (value) => (pattern) => pattern.just(value),
  nothing: () => (pattern) => pattern.nothing(),
}

const MAYBE = {
  unit: (value) => maybe.just(value),
  flatMap: (instanceM) => (transform) =>
    maybe.match(instanceM, {
      just: (value) => transform(value),
      nothing: () => maybe.nothing(),
    }),
  getOrElse: (instanceM) => (alternate) =>
    maybe.match(instanceM, {
      just: (value) => value,
      nothing: () => alternate,
    }),
}

const add = (maybeA, maybeB) =>
  MAYBE.flatMap(maybeA)((a) => MAYBE.flatMap(maybeB)((b) => MAYBE.unit(a + b)))

const justOne = maybe.just(1)
const justTwo = maybe.just(2)

test('Maybe モナドの足し算', () => {
  expect(MAYBE.getOrElse(justOne)(null)).toBe(1)

  expect(MAYBE.getOrElse(add(justOne, justOne))(null)).toBe(2)

  expect(MAYBE.getOrElse(add(justOne, maybe.nothing()))(null)).toBe(null)
})
