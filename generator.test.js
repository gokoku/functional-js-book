const stream = {
  match: (data, pattern) => data(pattern),
  empty: () => (pattern) => pattern.empty(),
  cons: (head, tailThunk) => (pattern) => pattern.cons(head, tailThunk),
  filter: (predicate) => (aStream) =>
    stream.match(aStream, {
      empty: () => stream.empty(),
      cons: (head, tailThunk) => {
        if (predicate(head)) {
          return stream.cons(head, () => stream.filter(predicate)(tailThunk()))
        } else {
          return stream.filter(predicate)(tailThunk())
        }
      },
    }),

  remove: (predicate) => (aStream) => stream.filter(not(predicate))(aStream),
}

const generate = (aStream) => {
  let _stream = aStream
  return () =>
    stream.match(_stream, {
      empty: () => null,
      cons: (head, tailThunk) => {
        _stream = tailThunk()
        return head
      },
    })
}

const ones = () => stream.cons(1, () => ones())
const enumFrom = (n) => stream.cons(n, () => enumFrom(n + 1))

const integers = enumFrom(0)
const intGenerator = generate(integers)
const multipleOf = (n) => (m) => {
  if (m % n === 0) {
    return true
  } else {
    return false
  }
}
const not = (predicate) => (arg) => !predicate(arg)

test('infinity int', () => {
  expect(intGenerator()).toBe(0)
  expect(intGenerator()).toBe(1)
  expect(intGenerator()).toBe(2)
})

/** ---------------------------------------- */
const sieve = (aStream) =>
  stream.match(aStream, {
    empty: () => null,
    cons: (head, tailThunk) =>
      stream.cons(head, () =>
        sieve(stream.remove((item) => multipleOf(head)(item))(tailThunk())),
      ),
  })

const primes = sieve(enumFrom(2))
const primeGenerator = generate(primes)

test('Eratosthenes Sieve', () => {
  expect(primeGenerator()).toBe(2)
  expect(primeGenerator()).toBe(3)
  expect(primeGenerator()).toBe(5)
  expect(primeGenerator()).toBe(7)
  expect(primeGenerator()).toBe(11)
  expect(primeGenerator()).toBe(13)
})
