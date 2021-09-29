const ID = {
  unit: (value) => value,
  flatMap: (instanceM) => (transform) => transform(instanceM),
}
const succ = (n) => n + 1
const double = (n) => n * 2
const compose = (f, g) => (arg) => f(g(arg))

test('unit monad', () => {
  expect(ID.unit(1)).toBe(1)
})

test('flatMap monad', () => {
  expect(ID.flatMap(ID.unit(1))((one) => ID.unit(succ(one)))).toBe(succ(1))
})

test('compose', () => {
  expect(compose(double, succ)(1)).toBe(4)
})

test('flatMap monad', () => {
  expect(
    ID.flatMap(ID.unit(1))((one) =>
      ID.flatMap(ID.unit(succ(one)))((two) => ID.unit(double(two))),
    ),
  ).toBe(compose(double, succ)(1))
})

/** 恒等モナド則 */
const instanceM = ID.unit(1)

const f = (n) => ID.unit(n + 1)

const g = (n) => ID.unit(-n)

test('右単位元則', () => {
  expect(ID.flatMap(instanceM)(ID.unit)).toBe(instanceM)
})

test('左単位原則', () => {
  expect(ID.flatMap(ID.unit(1))(f)).toBe(f(1))
})

test('結合法則', () => {
  expect(ID.flatMap(ID.flatMap(instanceM)(f))(g)).toBe(
    ID.flatMap(instanceM)((x) => ID.flatMap(f(x))(g)),
  )
})
