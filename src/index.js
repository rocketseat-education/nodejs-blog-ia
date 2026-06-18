import http from 'node:http'

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ message: "Hello World" })) 
})

server.listen(9090, () => {
  console.log('Server running on http://localhost:9090')
})
