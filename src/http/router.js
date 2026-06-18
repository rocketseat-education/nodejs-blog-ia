function matchPath(routePath, requestPath) {
  const routeParts = routePath.split('/').filter(Boolean)
  const requestParts = requestPath.split('/').filter(Boolean)

  if (routeParts.length !== requestParts.length) {
    return null
  }

  const params = {}

  for (let i = 0; i < routeParts.length; i++) {
    const routePart = routeParts[i]
    const requestPart = requestParts[i]

    if (routePart.startsWith(':')) {
      params[routePart.slice(1)] = requestPart
    } else if (routePart !== requestPart) {
      return null
    }
  }

  return params
}

export function createRouter() {
  const routes = []

  function register(method, path, handler) {
    routes.push({ method, path, handler })
  }

  return {
    get(path, handler) {
      register('GET', path, handler)
    },

    post(path, handler) {
      register('POST', path, handler)
    },

    patch(path, handler) {
      register('PATCH', path, handler)
    },

    async dispatch(req, res) {
      const pathname = req.url.split('?')[0] || '/'

      for (const route of routes) {
        if (route.method !== req.method) {
          continue
        }

        const params = matchPath(route.path, pathname)

        if (params === null) {
          continue
        }

        req.params = params
        await route.handler(req, res)
        return
      }

      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Not Found' }))
    },
  }
}
