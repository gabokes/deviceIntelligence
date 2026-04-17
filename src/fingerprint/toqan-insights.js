async function analyzeInsightsWithToqan(deviceData, intelligenceData) {
  try {
    const cfg = KOIN_CONFIG.toqanInsights

    // 1. Crear conversación
    const createRes = await fetch(cfg.createUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: cfg.apiKey,
        message: JSON.stringify({
          device_data: deviceData,
          intelligence_findings: intelligenceData?.findings || []
        })
      })
    })

    if (!createRes.ok) {
      console.error('[ToqanInsights] create_conversation error:', createRes.status, await createRes.text())
      return null
    }

    const createData = await createRes.json()
    const { conversation_id, request_id } = createData

    if (!request_id) {
      console.error('[ToqanInsights] respuesta inesperada:', createData)
      return null
    }
    console.log('[ToqanInsights] request_id:', request_id)

    // 2. Polling
    const pollUrl = cfg.getAnswerUrl
      + '?conversation_id=' + encodeURIComponent(conversation_id)
      + '&request_id='      + encodeURIComponent(request_id)
      + '&apiKey='          + encodeURIComponent(cfg.apiKey)

    const deadline = Date.now() + cfg.pollTimeoutMs

    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, cfg.pollIntervalMs))

      const pollRes = await fetch(pollUrl)

      if (!pollRes.ok) {
        console.error('[ToqanInsights] get_answer error:', pollRes.status)
        continue
      }

      const pollData = await pollRes.json()
      console.log('[ToqanInsights] poll status:', pollData.status)

      if (pollData.status === 'finished') {
        const raw = typeof pollData.answer === 'string' ? pollData.answer : ''
        const clean = raw
          .replace(/<think>[\s\S]*?<\/think>/g, '')
          .replace(/^```(?:json)?\s*/m, '')
          .replace(/```\s*$/m, '')
          .trim()

        try {
          const answer = JSON.parse(clean)
          console.log('[ToqanInsights] overallScore:', answer?.meta?.overallScore)
          return {
            meta:         answer?.meta         || {},
            agents:       answer?.agents       || {},
            vectors:      answer?.vectors      || {},
            orchestrator: answer?.orchestrator || {}
          }
        } catch (e) {
          console.error('[ToqanInsights] parse error:', e.message)
          console.error('[ToqanInsights] texto que no se pudo parsear:', clean)
          return null
        }
      }
    }

    console.warn('[ToqanInsights] timeout esperando respuesta')
    return null

  } catch (e) {
    console.error('[ToqanInsights] error:', e)
    return null
  }
}
