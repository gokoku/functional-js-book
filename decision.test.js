const exp = {
  match: (anExp, pattern) => anExp.call(exp, pattern),
  num: (n) => (pattern) => pattern.num(n),
  add: (exp1, exp2) => (pattern) => pattern.add(exp1, exp2),
  amb: (alist) => (pattern) => pattern.amb(alist),
}

const calculate = (anExp) =>
  exp.match(anExp, {
    num: (n) => n,
    add: (exp1, exp2) => calculate(exp1) + calculate(exp2),
  })

test('decision', () => {
  expect(calculate(exp.num(3))).toBe(3)
})
const expression = exp.add(exp.num(2), exp.num(4))

test('expression', () => {
  expect(calculate(expression)).toBe(6)
})

const calculate2 = (anExp, continuesOnSuccess, continuesOnFailure) =>
  exp.match(anExp, {
    num: (n) => continuesOnSuccess(n, continuesOnFailure),
    add: (x, y) =>
      calculate2(
        x,
        (resultX, continuesOnFailureX) =>
          calculate2(
            y,
            (resultY, continuesOnFailureY) =>
              continuesOnSuccess(resultX + resultY, continuesOnFailureY),
            continuesOnFailureX,
          ),
        continuesOnFailure,
      ),
    amb: (choices) => {
      const calculateAmb = (choices) =>
        list.match(choices, {
          empty: () => continuesOnFailure(),
          cons: (head, tail) =>
            calculate2(head, continuesOnSuccess, () => calculateAmb(tail)),
        })
      return calculateAmb(choices)
    },
  })
