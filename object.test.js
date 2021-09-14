const object = {
  empty: () => null,
  set: (key, value) => (obj) => (queryKey) => {
    if (key === queryKey) {
      return value
    } else {
      return object.get(queryKey)(obj)
    }
  },
  get: (key) => (obj) => obj(key),
}

const compose = (f, g) => (x) => f(g(x))

const robots = compose(
  object.set('C3PO', 'star Wars'),
  object.set('HAL9000', '2001: a space odessay'),
)(object.empty())

test('object', () => {
  expect(object.get('HAL9000')(robots)).toBe('2001: a space odessay')
})
