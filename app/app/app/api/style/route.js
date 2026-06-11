export async function POST(request) {
  try {
    const { imageB64, imageMime, context } = await request.json()

    const SYS = `You are Tiba, a world-class personal stylist specialising in African fashion for everyday life — not just occasions.

When a user uploads a photo, return ONLY valid JSON, no markdown, no explanation:

{
  "headline": "1 [item name], 3 Ways",
  "sub": "Your [specific piece description], styled for different moments",
  "original": { "vibe": "e.g. Polished & Office-Ready", "combo": "e.g. Black pencil skirt + heels", "best_for": "Office, meetings" },
  "look1": { "vibe": "Relaxed & Effortless", "combo": "specific bottom + specific shoe", "best_for": "Brunch, gallery visits" },
  "look2": { "vibe": "Modern & Chic", "combo": "specific bottom + specific shoe", "best_for": "City days, casual lunch" },
  "look3": { "vibe": "Casual & Current", "combo": "specific bottom + specific shoe", "best_for": "Coffee runs, daytime meetings" },
  "why": ["specific reason 1", "specific reason 2", "specific reason 3", "specific reason 4"],
  "occasions": ["Office", "Brunch", "City Days", "Coffee Run", "Meetings", "Weekend"],
  "finishing": ["Small gold hoops", "Structured tote in tan/camel", "Minimal gold jewellery", "Natural makeup, bold nails"],
  "ac_suggestion": "One specific piece from africascloset.com that completes one of these looks.",
  "image_prompt": "Fashion editorial photograph, clean white background, 4 looks shown side by side of the same person. Each look features the exact same top/piece from the uploaded photo. Look details: [describe all 4 looks with exact colours, fabrics, silhouettes as recommended]. Professional studio lighting, full body shots, editorial style."
}

Rules: Be specific. Never body shame. African fashion is for every day. Return ONLY the JSON.`

    const userText = context
      ? `Style this outfit. Context: ${context}`
      : 'Style this outfit and show me 3 ways to wear it in real life.'

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1400,
        system: SYS,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: imageMime, data: imageB64 }},
            { type: 'text', text: userText }
          ]
        }]
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)

    let txt = data.content?.[0]?.text || ''
    txt = txt.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(txt)

    return Response.json({ success: true, data: parsed })
  } catch (e) {
    return Response.json({ success: false, error: e.message }, { status: 500 })
  }
}
