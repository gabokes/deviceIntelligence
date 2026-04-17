async function analyzeWithToqan(deviceData) {
  try {
    const cfg = KOIN_CONFIG.toqan

    // 1. Crear conversación
    const createRes = await fetch(cfg.createUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: cfg.apiKey,
        message: JSON.stringify(deviceData)
      })
    })

    if (!createRes.ok) {
      console.error('[Toqan] create_conversation error:', createRes.status, await createRes.text())
      return null
    }

    const createData = await createRes.json()
    const { request_id } = createData

    if (!request_id) {
      console.error('[Toqan] respuesta inesperada:', createData)
      return null
    }
    console.log('[Toqan] request_id:', request_id)

    // 2. Polling
    const pollUrl = cfg.getAnswerUrl
      + '?request_id=' + encodeURIComponent(request_id)
      + '&apiKey='     + encodeURIComponent(cfg.apiKey)

    const deadline = Date.now() + cfg.pollTimeoutMs

    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, cfg.pollIntervalMs))

      const pollRes = await fetch(pollUrl)

      if (!pollRes.ok) {
        console.error('[Toqan] get_answer error:', pollRes.status)
        continue
      }

      const pollData = await pollRes.json()
      console.log('[Toqan] poll status:', pollData.status)

      if (pollData.status === 'finished') {
        const raw = typeof pollData.answer === 'string' ? pollData.answer : ''
        const clean = raw
          .replace(/<think>[\s\S]*?<\/think>/g, '')
          .replace(/^```(?:json)?\s*/m, '')
          .replace(/```\s*$/m, '')
          .trim()

        try {
          const answer = JSON.parse(clean)
          console.log('[Toqan] findings:', answer?.findings?.length ?? 0)
          return { findings: answer?.findings || [] }
        } catch (e) {
          console.error('[Toqan] parse error:', e.message)
          console.error('[Toqan] texto que no se pudo parsear:', clean)
          return null
        }
      }
    }

    console.warn('[Toqan] timeout esperando respuesta')
    return null

  } catch (e) {
    console.error('[Toqan] error:', e)
    return null
  }
}
