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
  log: (anExp) => (pattern) => pattern.log(anExp),
  match: (data, pattern) => data(pattern),
  num: (value) => (pattern) => {
    return pattern.num(value)
  },
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

var evaluate = (anExp, environment) =>
  exp.match(anExp, {
    /* log???????????? */
    log: (anExp) =>
      LOG.flatMap(evaluate(anExp, environment))((value) =>
        LOG.flatMap(LOG.output(value))((_) => LOG.unit(value)),
      ),
    /* ??????????????? */
    num: (value) => LOG.unit(value),
    /* ??????????????? */
    variable: (name) => {
      return LOG.unit(env.lookup(name, environment))
    },
    /* ?????????????? */
    lambda: (variable, body) =>
      exp.match(variable, {
        variable: (name) =>
          LOG.unit((actualArg) =>
            evaluate(body, env.extend(name, actualArg, environment)),
          ),
      }),
    /* ????????????????????? */
    app: (lambda, arg) =>
      LOG.flatMap(evaluate(lambda, environment))((closure) =>
        LOG.flatMap(evaluate(arg, environment))((actualArg) =>
          closure(actualArg),
        ),
      ),
    add: (expL, expR) =>
      LOG.flatMap(evaluate(expL, environment))((valueL) =>
        LOG.flatMap(evaluate(expR, environment))((valueR) =>
          LOG.unit(valueL + valueR),
        ),
      ),
  })
/** LOG ??????????????????
 *
 * LOG[T] = PAIR[T, LIST[STRING]] */
var LOG = {
  /* unit:: VALUE => LOG[VALUE] */
  unit: (value) => pair.cons(value, list.empty()),
  /* flatMap:: LOG[T] => FUN[T => LOG[T]] => LOG[T] */
  flatMap: (instanceM) => (transform) =>
    pair.match(instanceM, {
      /* Pair??????????????????????????????????????????????????? */
      cons: (value, log) => {
        /* ????????????????????????????????? */
        var newInstance = transform(value)
        /* ??????????????????Pair????????????????????????
             ??????????????????Pair???????????????????????? */
        return pair.cons(
          pair.left(newInstance),
          list.append(log)(pair.right(newInstance)),
        )
      },
    }),

  /* ?????? value ???????????????????????? */
  /* output:: VALUE => LOG[()] */
  output: (value) => pair.cons(null, list.cons(String(value), list.empty())),
}

test('log num', () => {
  pair.match(evaluate(exp.log(exp.num(2)), env.empty), {
    cons: (value, log) => {
      expect(
        // ??????????????????????????????
        value,
      ).toBe(2)
      expect(
        // ??????????????????????????????
        list.toArray(log),
      ).toStrictEqual(['2'])
    },
  })
})

test('log out', () => {
  const theExp = exp.log(
    exp.app(
      exp.lambda(
        exp.variable('n'),
        exp.add(exp.log(exp.num(1)), exp.variable('n')),
      ),
      exp.log(exp.num(2)),
    ),
  )

  pair.match(evaluate(theExp, env.empty), {
    cons: (value, log) => {
      expect(value).toBe(3)
      expect(list.toArray(log)).toStrictEqual(['2', '1', '3'])
    },
  })
})
