const compose = (f, g) => (arg) => f(g(arg))

const f = (x) => x * x + 1
const g = (x) => x - 2

test('compose', () => {
  expect(compose(f, g)(2)).toBe(f(g(2)))
  expect(compose(f, g)(2)).toBe(1)
})

const opposite = (n) => -n
const addCurried = (x) => (y) => x + y
test('opposite', () => {
  expect(compose(opposite, opposite)(2)).toBe(2)
  expect(compose(opposite, addCurried(2))(3)).toBe(-5)
})
