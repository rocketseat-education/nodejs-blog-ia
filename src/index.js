import http from 'node:http'

// Req = Request (Requisição)
// Res = Response (Resposta)
const server = http.createServer((req, res) => {
  const { url, method, headers } = req
  const path = url.split('?')[0]
  const params = url.split('?')[1].split('&').map(param => param.split('='))
  console.log("method", method)
  console.log("path", path)
  console.log("params", params)

  if (path === '/products' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ data: [{ id: 1, name: "Product 1" }] }))
  }

  if (path === '/products' && method === 'POST') {
    const bodyBuffer = []
    let body = null
    
    // Armazena o corpo da requisição em um array
    req.on('data', chunk => bodyBuffer.push(chunk))
    req.on('end', () => {
      const bodyString = Buffer.concat(bodyBuffer).toString()
      body = JSON.parse(bodyString)

      res.writeHead(201, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ message: "Product created", body }))
    })

    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  return res.end(JSON.stringify({ message: "Not Found" })) 
})

server.listen(9090, () => {
  console.log('Server running on http://localhost:9090')
})
