const net = require('net')
const socket = net.connect({
  host: '127.0.0.1',
  port: 3000,
})

socket.on('connect', () => {
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read()
    if (chunk !== null) {
      const maybeInt = parseInt(chunk, 10)
      if (isNaN(maybeInt)) {
        process.stdout.write(chunk.toUpperCase())
      } else {
        socket.write(maybeInt + '\r\n')
      }
    }
  })
})

socket.on('data', (chunk) => {
  process.stdout.write(chunk.toString())
})
