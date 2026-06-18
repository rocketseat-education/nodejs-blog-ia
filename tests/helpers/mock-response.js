export function createMockResponse() {
  const res = {
    statusCode: null,
    headers: {},
    body: null,
    writeHead(status, headers) {
      this.statusCode = status
      Object.assign(this.headers, headers)
    },
    end(data) {
      this.body = data
    },
  }

  return res
}
