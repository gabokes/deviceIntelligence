// Test rápido de los dos agentes Toqan desde Node (sin browser, sin CORS)
// Uso: node test-agents.js

const https = require('https')

const AGENTS = {
  toqan: {
    name: 'Agente intelligence (findings)',
    apiKey: 'sk_228878efacda9efdbad502b6c89ff222fd8542dcfd774cccd51e470d240aab05cf6d6822aad36cfb34c4651f88c85d27b5f4dd2866db622d1e6a87dbcbe4',
  },
  toqanInsights: {
    name: 'Agente insights (scores/vectores)',
    apiKey: 'sk_d98ac4955e46ed6c7a8dd3e5127dc26aa8ce668dd0e09df2c4eb9b9155c35f474544531f6c279ab4bbd4eaf7c7ca10ed5a511d8a232c624d452ee739c204',
  }
}

const TEST_MESSAGE = JSON.stringify({ test: true, cores: 4, gpuVendor: 'ANGLE', timezone: -3, lang: 'es-ES' })

function request(method, path, apiKey, body) {
  return new Promise(function(resolve, reject) {
    const opts = {
      hostname: 'api.toqan.ai',
      port: 443,
      path: path,
      method: method,
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
      }
    }
    const req = https.request(opts, function(res) {
      let data = ''
      res.on('data', function(c){ data += c })
      res.on('end', function(){ resolve({ status: res.statusCode, body: data }) })
    })
    req.on('error', reject)
    if (body) req.write(body)
    req.end()
  })
}

async function testAgent(key, cfg) {
  console.log('\n══════════════════════════════════')
  console.log('Probando:', cfg.name)
  console.log('══════════════════════════════════')

  // 1. Crear conversación
  console.log('→ create_conversation...')
  const createRes = await request('POST', '/api/create_conversation', cfg.apiKey,
    JSON.stringify({ user_message: TEST_MESSAGE })
  )

  console.log('  status HTTP:', createRes.status)

  if (createRes.status !== 200) {
    console.log('  ✗ ERROR — respuesta:', createRes.body.slice(0, 200))
    return
  }

  let parsed
  try { parsed = JSON.parse(createRes.body) } catch(e) {
    console.log('  ✗ No se pudo parsear:', createRes.body.slice(0, 200))
    return
  }

  const { conversation_id, request_id } = parsed
  if (!conversation_id || !request_id) {
    console.log('  ✗ Sin conversation_id/request_id:', createRes.body.slice(0, 200))
    return
  }
  console.log('  ✓ request_id:', request_id)

  // 2. Polling — máx 3 minutos
  const pollPath = '/api/get_answer?conversation_id=' + encodeURIComponent(conversation_id)
    + '&request_id=' + encodeURIComponent(request_id)

  const deadline = Date.now() + 180000
  let polls = 0

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 5000))
    polls++

    const pollRes = await request('GET', pollPath, cfg.apiKey)
    if (pollRes.status !== 200) {
      console.log('  poll', polls, '— HTTP', pollRes.status, '(reintentando...)')
      continue
    }

    let pdata
    try { pdata = JSON.parse(pollRes.body) } catch(e) { continue }

    console.log('  poll', polls, '— status:', pdata.status)

    if (pdata.status === 'finished') {
      const raw = (pdata.answer || '').replace(/<think>[\s\S]*?<\/think>/g,'').trim()
      console.log('  ✓ RESPONDIÓ en ~' + (polls * 5) + 's')
      console.log('  Primeros 500 chars de la respuesta:')
      console.log('  ' + raw.slice(0, 500))
      return
    }
  }

  console.log('  ✗ TIMEOUT después de 3 minutos (' + polls + ' polls)')
}

async function main() {
  for (const [key, cfg] of Object.entries(AGENTS)) {
    await testAgent(key, cfg)
  }
  console.log('\n══════════════════════════════════')
  console.log('Test terminado')
}

main().catch(console.error)
