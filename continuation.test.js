const identity = (n) => n
const succ = (n, continues) => continues(n + 1)

test('succ continuation', () => {
  expect(succ(1, identity)).toBe(2)
})

const add = (n, m, continues) => continues(n + m)

test('add continuation', () => {
  expect(succ(3, (succResult) => add(2, succResult, identity))).toBe(6)
})

const stream = {
  match: (data, pattern) => data(pattern),
  empty: () => (pattern) => pattern.empty(),
  cons: (head, tailThunk) => (pattern) => pattern.cons(head, tailThunk),
  enumFrom: (n) => stream.cons(n, () => stream.enumFrom(n + 1)),
}

const find = (aStream, predicate, continuesOnFailure, continuesOnSuccess) =>
  stream.match(aStream, {
    empty: () => continuesOnSuccess(null),
    cons: (head, tailThunk) => {
      if (predicate(head) === true) {
        return continuesOnSuccess(head)
      } else {
        return continuesOnFailure(
          tailThunk(),
          predicate,
          continuesOnFailure,
          continuesOnSuccess,
        )
      }
    },
  })

const continuesOnSuccess = identity
const continuesOnFailure = (
  aStream,
  predicate,
  continuesOnRecursion,
  escapesFromRecursion,
) => find(aStream, predicate, continuesOnRecursion, escapesFromRecursion)

const integers = stream.enumFrom(0)

test('find', () => {
  expect(
    find(
      integers,
      (item) => item === 100,
      continuesOnFailure,
      continuesOnSuccess,
    ),
  ).toBe(100)
})
