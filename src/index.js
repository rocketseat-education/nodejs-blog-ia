import http from 'node:http'

const { API_PORT, API_HOST, API_PROTOCOL } = process.env

const posts = []

// Req = Request (Requisição)
// Res = Response (Resposta)
const server = http.createServer((req, res) => {
  const { url, method } = req
  const paths = url.split('?').filter(Boolean)
  const path = paths.at(0) || '/'

  if (path === '/posts' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ data: posts }))
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

server.listen(API_PORT, API_HOST, () => {
  console.log(`Server running on ${API_PROTOCOL}://${API_HOST}:${API_PORT}`)
  console.log("Press CTRL+C to stop")
})
