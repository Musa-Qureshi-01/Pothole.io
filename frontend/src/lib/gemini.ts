import axios from 'axios'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

export const generateAIReport = async (
  complaintText: string,
  severity: string,
  location: { lat: number; lng: number },
  detectionResult: any
) => {
  const prompt = `
    You are an expert civil engineer and infrastructure safety analyst. 
    Analyze the following pothole detection data and generate a professional maintenance report.

    **Incident Details:**
    - **Reported Location:** ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}
    - **Visual Severity Analysis:** ${severity}
    - **User Field Observations:** "${complaintText}"
    - **AI Detection Confidence:** ${detectionResult.confidence || 'N/A'}%
    - **Surface Area Impact:** ${detectionResult.area_pixels || 'N/A'} pixels (approximate)

    **Required Output (JSON Format Only):**
    Please provide a structured JSON response with the following fields:
    1. "summary": A concise, executive-level summary of the issue (2-3 sentences), citing the severity and location context.
    2. "riskLevel": The calculated risk level (Low / Medium / High / Critical) based on the size and severity.
    3. "recommendedAction": Specific maintenance action required (e.g., "Immediate cold patch", "Resurfacing required", "Monitor status").
    4. "civicImpact": A brief statement on how this impacts public safety or traffic flow (e.g., "High risk to two-wheelers", "Potential for vehicle damage").

    Ensure the tone is professional, objective, and actionable for municipal authorities.
  `

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }
    )

    const text = response.data.contents?.[0]?.parts?.[0]?.text || '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text }
  } catch (error) {
    console.error('Gemini API error:', error)
    return { summary: 'Unable to generate AI report at this time.' }
  }
}

export const generateChatResponse = async (message: string, conversationHistory: any[]) => {
  const systemPrompt = `You are a helpful AI assistant for a pothole detection and civic reporting platform. 
    Help users report potholes, track their reports, understand detection results, and guide them through the process.
    Be concise, friendly, and actionable. Do not use emojis in your responses.`

  const messages = [
    ...conversationHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.message }],
    })),
    {
      role: 'user',
      parts: [{ text: message }],
    },
  ]

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${GEMINI_API_KEY}`,
      {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: messages,
      }
    )

    return response.data.contents?.[0]?.parts?.[0]?.text || 'Sorry, I could not process that. Please try again.'
  } catch (error) {
    console.error('Chat API error:', error)
    return 'I encountered an error. Please try again.'
  }
}
