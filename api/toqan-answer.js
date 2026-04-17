export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  const { request_id, apiKey } = req.query

  const response = await fetch(
    `https://api.toqan.ai/api/get_answer?request_id=${request_id}`,
    {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    }
  )

  const data = await response.json()
  res.status(response.status).json(data)
}
