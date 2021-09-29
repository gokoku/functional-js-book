var net = require('net')
var localhost = '127.0.0.1'

/** たらい回し関数(竹内関数) */
const tarai = (x, y, z) => {
  if (x > y) {
    return tarai(tarai(x - 1, y, z), tarai(y - 1, z, x), tarai(z - 1, x, y))
  } else {
    return y
  }
}

net
  .createServer((socket) => {
    socket.on('data', (incomingData) => {
      const number = parseInt(incomingData, 10)
      console.log(number)
      socket.write(tarai(number * 2, number, 0) + '\r\n')
    })
    socket.on('close', (error) => {
      console.log('connection closed')
    })
  })
  .listen(3000, localhost)
