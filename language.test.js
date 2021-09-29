const ID = {
  /** unit:: T => ID[T] */
  unit: (value) => value,
  /** flatMap:: ID[T] => FUN[T => ID[T]] => ID[T] */
  flatMap: (instanceM) => (transform) => transform(instanceM),
}

var pair = {
  match: (data, pattern) => data.call(pair, pattern),
  cons: (left, right) => (pattern) => pattern.cons(left, right),

  right: (tuple) =>
    pair.match(tuple, {
      cons: (_, right) => {
        return right
      },
    }),

  left: (tuple) =>
    pair.match(tuple, {
      cons: (left, right) => {
        return left
      },
    }),
}

var list = {
  match: (data, pattern) => data.call(list, pattern),
  empty: (_) => (pattern) => pattern.empty(),
  cons: (head, tail) => (pattern) => pattern.cons(head, tail),
  head: (alist) =>
    list.match(alist, {
      empty: (_) => {
        return undefined
      },
      cons: (head, tail) => {
        return head
      },
    }),

  tail: (alist) =>
    list.match(alist, {
      empty: (_) => {
        return undefined
      },
      cons: (head, tail) => {
        return tail
      },
    }),

  /* append:: LIST[T] -> LIST[T] -> LIST[T] */
  append: (xs) => (ys) =>
    list.match(xs, {
      empty: (_) => {
        return ys
      },
      cons: (head, tail) => {
        return list.cons(head, list.append(tail)(ys))
      },
    }),

  /* foldr:: LIST[T] -> T -> FUN[T -> LIST] -> T */
  foldr: (alist) => (accumulator) => (glue) =>
    list.match(alist, {
      empty: (_) => {
        return accumulator
      },
      cons: (head, tail) => {
        return glue(head)(list.foldr(tail)(accumulator)(glue))
      },
    }),

  toArray: (alist) =>
    list.foldr(alist)([])(
      (item) => (accumulator) => [item].concat(accumulator),
    ),
}

var exp = {
  match: (data, pattern) => data(pattern),
  num: (value) => (pattern) => pattern.num(value),
  variable: (name) => (pattern) => pattern.variable(name),
  lambda: (variable, body) => (pattern) => pattern.lambda(variable, body),
  app: (lambda, arg) => (pattern) => pattern.app(lambda, arg),
  add: (expL, expR) => (pattern) => pattern.add(expL, expR),
}

const env = {
  /** empty:: STRING => VALUE */
  empty: (_) => undefined,
  /** lookup:: (STRING, ENV) => VALUE */
  lookup: (name, environment) => environment(name),
  /** extend:: (STRING, VALUE, ENV) => ENV */
  extend: (identifier, value, environment) => (queryIdentifier) => {
    if (identifier === queryIdentifier) {
      return value
    } else {
      return env.lookup(queryIdentifier, environment)
    }
  },
}

/** 変数バインディングにおける環境のセマンティクス */
test('variable binding', () => {
  /**
   * var a = 1
   * a
   */
  expect(
    ((_) => {
      const newEnv = env.extend('a', 1, env.empty)
      return env.lookup('a', newEnv)
    })(),
  ).toBe(1)
})

/** クロージャーにおける環境のセマンティクス */
test('closure', () => {
  /**
   * var x = 1;
   * var closure = () => {
   *   var y = 2;
   *   return x + y
   * }
   */
  expect(
    ((_) => {
      const initEnv = env.empty
      const outerEnv = env.extend('x', 1, initEnv)

      const closureEnv = env.extend('y', 2, outerEnv)
      return env.lookup('x', closureEnv) + env.lookup('y', closureEnv)
    })(),
  ).toBe(3)
})

var evaluate = (anExp, environment) =>
  exp.match(anExp, {
    num: (numericValue) => ID.unit(numericValue),
    variable: (name) => ID.unit(env.lookup(name, environment)),
    // 関数定義（λ式）の評価
    lambda: (variable, body) =>
      exp.match(variable, {
        variable: (name) =>
          ID.unit((actualArg) =>
            evaluate(body, env.extend(name, actualArg, environment)),
          ),
      }),

    // 関数適用の評価
    app: (lambda, arg) =>
      ID.flatMap(evaluate(lambda, environment))((closure) =>
        ID.flatMap(evaluate(arg, environment))((actualArg) =>
          closure(actualArg),
        ),
      ),

    add: (expL, expR) =>
      ID.flatMap(evaluate(expL, environment))((valueL) =>
        ID.flatMap(evaluate(expR, environment))((valueR) =>
          ID.unit(valueL + valueR),
        ),
      ),
  })

test('num evaluation', () => {
  expect(evaluate(exp.num(2), env.empty)).toBe(ID.unit(2))
})
test('variable evaluation', () => {
  const newEnv = env.extend('x', 1, env.empty)
  expect(evaluate(exp.variable('x'), newEnv)).toBe(ID.unit(1))
})
test('add evaluation', () => {
  const addition = exp.add(exp.num(1), exp.num(2))
  expect(evaluate(addition, env.empty)).toBe(ID.unit(3))
})
test('app apply', () => {
  /**
   * ((n) => { return n + 1 })(2)
   */
  const expression = exp.app(
    exp.lambda(exp.variable('n'), exp.add(exp.variable('n'), exp.num(1))),
    exp.num(2),
  )

  expect(evaluate(expression, env.empty)).toBe(ID.unit(3))
})
test('app inner apply', () => {
  /**
   * ((n) => (m) => n + m))(2)(3)
   */
  const expression = exp.app(
    exp.app(
      exp.lambda(
        exp.variable('n'),
        exp.lambda(
          exp.variable('m'),
          exp.add(exp.variable('n'), exp.variable('m')),
        ),
      ),
      exp.num(2),
    ),
    exp.num(3),
  )

  expect(evaluate(expression, env.empty)).toBe(ID.unit(5))
})
