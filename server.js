const http  = require('http')
const https = require('https')
const fs    = require('fs')
const path  = require('path')

const PORT = 3003
const ROOT = __dirname  // sirve raíz — los HTMLs están copiados aquí desde src/pages/

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon'
}

const HOP_BY_HOP = ['connection','keep-alive','proxy-authenticate','proxy-authorization',
  'te','trailers','transfer-encoding','upgrade','origin','referer','host']

function toqanProxy(req, res, toqanPath) {
  const options = {
    hostname: 'api.toqan.ai',
    port: 443,
    path: '/api/' + toqanPath,
    method: req.method,
    headers: {}
  }

  // Copiar headers filtrando hop-by-hop
  for (const [k, v] of Object.entries(req.headers)) {
    if (!HOP_BY_HOP.includes(k.toLowerCase())) {
      options.headers[k] = v
    }
  }

  const proxyReq = https.request(options, proxyRes => {
    res.writeHead(proxyRes.statusCode, {
      'Content-Type': proxyRes.headers['content-type'] || 'application/json',
      'Access-Control-Allow-Origin': '*'
    })
    proxyRes.pipe(res)
  })

  proxyReq.on('error', err => {
    console.error('[proxy] error:', err.message)
    res.writeHead(502)
    res.end('Bad Gateway')
  })

  if (req.method === 'POST') {
    req.pipe(proxyReq)
  } else {
    proxyReq.end()
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')

  // /api/toqan-create → POST proxy
  if (url.pathname === '/api/toqan-create') {
    if (req.method === 'OPTIONS') {
      res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' })
      return res.end()
    }
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => {
      const { apiKey, message } = JSON.parse(body)
      const payload = JSON.stringify({ user_message: message })
      const options = {
        hostname: 'api.toqan.ai', port: 443,
        path: '/api/create_conversation', method: 'POST',
        headers: { 'X-Api-Key': apiKey, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) }
      }
      const pr = https.request(options, pres => {
        let d = ''
        pres.on('data', c => d += c)
        pres.on('end', () => {
          res.writeHead(pres.statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
          res.end(d)
        })
      })
      pr.on('error', e => { res.writeHead(502); res.end(e.message) })
      pr.write(payload)
      pr.end()
    })
    return
  }

  // /api/toqan-answer → GET proxy
  if (url.pathname === '/api/toqan-answer') {
    if (req.method === 'OPTIONS') {
      res.writeHead(200, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' })
      return res.end()
    }
    const conversation_id = url.searchParams.get('conversation_id')
    const request_id      = url.searchParams.get('request_id')
    const apiKey          = url.searchParams.get('apiKey')
    const options = {
      hostname: 'api.toqan.ai', port: 443,
      path: '/api/get_answer?conversation_id=' + encodeURIComponent(conversation_id) + '&request_id=' + encodeURIComponent(request_id),
      method: 'GET',
      headers: { 'X-Api-Key': apiKey }
    }
    const pr = https.request(options, pres => {
      let d = ''
      pres.on('data', c => d += c)
      pres.on('end', () => {
        res.writeHead(pres.statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' })
        res.end(d)
      })
    })
    pr.on('error', e => { res.writeHead(502); res.end(e.message) })
    pr.end()
    return
  }

  // Archivos estáticos
  let filePath = path.join(ROOT, url.pathname === '/' ? 'landing.html' : url.pathname)
  if (!fs.existsSync(filePath)) {
    res.writeHead(404); return res.end('Not found')
  }
  const ext = path.extname(filePath)
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain', 'Cache-Control': 'no-store' })
  fs.createReadStream(filePath).pipe(res)
})

server.listen(PORT, () => console.log('http://localhost:' + PORT))
