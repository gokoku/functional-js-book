const pair = {
  cons: (left, right) => (pattern) => pattern.cons(left, right),
  match: (data, pattern) => data(pattern),
  right: (tuple) =>
    pair.match(tuple, {
      cons: (_, right) => right,
    }),
  left: (tuple) =>
    pair.match(tuple, {
      cons: (left, _) => left,
    }),
}

/**
 * 外界を明示しない IO モナドの定義
 */

const IO = {
  /* unit:: T => IO[T] */
  unit: (any) => (_) => any,
  /* flatMap:: IO[A] => FUN[A => IO[B]] => IO[B] */
  flatMap: (instanceA) => (actionAB) => actionAB(IO.run(instanceA)),
  /* done:: T => IO[T] */
  done: (any) => IO.unit(null),
  /* run:: IO[A] => A */
  run: (instance) => instance(),
  /* readFile:: STRING => IO[STRING] */
  readFile: (path) => {
    const fs = require('fs')
    return IO.unit(fs.readFileSync(path, 'utf-8'))
  },
  /* println:: STRING => IO[] */
  println: (message) => {
    console.log(message)
    return IO.unit(null)
  },
  /* IO.putChar:: CHAR => IO[] */
  putChar: (character) => {
    process.stdout.write(character)
    return IO.unit(null)
  },

  /**
   * seq関数は、2つのIOアクションを続けて実行する
   */
  // IO.seq:: IO[T] => IO[U] => IO[U]
  seq: (actionA) => (actionB) =>
    IO.unit(
      IO.run(IO.flatMap(actionA)((_) => IO.flatMap(actionB)((_) => IO.done()))),
    ),
  /* IO.putStr:: LIST[CHAR] => IO[] */
  putStr: (alist) =>
    list.match(alist, {
      empty: () => IO.done(),
      cons: (head, tail) => IO.seq(IO.putChar(head))(IO.putStr(tail)),
    }),
  putStrLn: (alist) => IO.seq(IO.putStr(alist))(IO.putChar('\n')),
}

const list = {
  empty: () => (pattern) => pattern.empty(),
  cons: (value, list) => (pattern) => pattern.cons(value, list),
  match: (data, pattern) => data(pattern),
}

const string = {
  head: (str) => str[0],
  tail: (str) => str.substring(1),
  isEmpty: (str) => str.length === 0,
  toList: (str) => {
    if (string.isEmpty(str)) {
      return list.empty()
    } else {
      return list.cons(string.head(str), string.toList(string.tail(str)))
    }
  },
}
//test('IO', () => {
//  expect(IO.run(IO.println('名前はまだない'))).toBe(null)
//})

const path = process.argv[2]

const cat = IO.flatMap(IO.readFile(path))((content) => {
  const string_as_list = string.toList(content)
  return IO.flatMap(IO.putStrLn(string_as_list))((_) => IO.done(_))
})

IO.run(cat)
// $ node io-monad.test.js ./text.txt
