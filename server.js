// Servidor de desarrollo — sirve src/ como estático y proxea /proxy/toqan/* a api.toqan.ai
// Sin dependencias externas — solo Node.js built-in

const http  = require('http')
const https = require('https')
const fs    = require('fs')
const path  = require('path')

const PORT    = 3002
const SRC_DIR = path.join(__dirname, 'src')

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
}

function serveStatic(req, res) {
  const rawPath = req.url.split('?')[0]
  const filePath = rawPath === '/'
    ? path.join(SRC_DIR, 'pages', 'landing.html')
    : path.join(SRC_DIR, rawPath)

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return }
    const ext = path.extname(filePath)
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain', 'Cache-Control': 'no-store' })
    res.end(data)
  })
}

// Headers hop-by-hop que no se deben reenviar al servidor externo
const HOP_BY_HOP = ['connection','keep-alive','proxy-authenticate','proxy-authorization',
  'te','trailers','transfer-encoding','upgrade','origin','referer','host']

function proxyToqan(req, res) {
  const toqanPath = req.url.replace('/proxy/toqan', '/api')

  // Filtrar headers problemáticos
  const forwardHeaders = { host: 'api.toqan.ai' }
  Object.keys(req.headers).forEach(function(k) {
    if (!HOP_BY_HOP.includes(k.toLowerCase())) forwardHeaders[k] = req.headers[k]
  })

  const options = {
    hostname: 'api.toqan.ai',
    port: 443,
    path: toqanPath,
    method: req.method,
    headers: forwardHeaders,
  }

  const proxyReq = https.request(options, function(proxyRes) {
    const headers = Object.assign({}, proxyRes.headers, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
    })
    res.writeHead(proxyRes.statusCode, headers)
    proxyRes.pipe(res)
  })

  proxyReq.on('error', function(e) {
    console.error('[proxy] error:', e.message)
    if (!res.headersSent) { res.writeHead(502); res.end('Proxy error') }
  })

  proxyReq.on('timeout', function() {
    console.error('[proxy] timeout')
    proxyReq.destroy()
    if (!res.headersSent) { res.writeHead(504); res.end('Proxy timeout') }
  })

  if (req.method === 'POST') {
    req.pipe(proxyReq)
  } else {
    proxyReq.end()
  }
}

const server = http.createServer(function(req, res) {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
    })
    res.end()
    return
  }

  if (req.url.startsWith('/proxy/toqan')) {
    proxyToqan(req, res)
  } else {
    serveStatic(req, res)
  }
})

server.listen(PORT, function() {
  console.log('Koin dev server corriendo → http://localhost:' + PORT + '/pages/landing.html')
})
