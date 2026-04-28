const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const OPENROUTER_URL = import.meta.env.VITE_OPENROUTER_URL ?? 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL ?? 'google/gemma-3-27b-it:free'

const MANUS_API_KEY = import.meta.env.VITE_MANUS_API_KEY
const MANUS_START_URL = import.meta.env.VITE_MANUS_START_URL ?? 'https://api.manus.ai/v2/task.create'
const MANUS_POLL_URL = import.meta.env.VITE_MANUS_POLL_URL ?? 'https://api.manus.ai/v2/task.listMessages'

const extractAssistantText = (content: unknown) => {
  if (typeof content === 'string') return content.trim()
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object' && 'text' in part) {
          return String((part as { text?: string }).text ?? '')
        }
        return ''
      })
      .join(' ')
      .trim()
  }
  return ''
}

const buildFallbackSupportResponse = (message: string) => {
  const normalized = message.toLowerCase()

  if (normalized.includes('report') || normalized.includes('submit')) {
    return 'To report a pothole, sign in and open the Prediction page. Upload a road image, review the detection, then submit the report so it reaches the tracking workflow.'
  }

  if (normalized.includes('track') || normalized.includes('status') || normalized.includes('history')) {
    return 'You can track your reports from your profile dashboard. Recent submissions, progress updates, and resolved reports are shown there once the report is saved successfully.'
  }

  if (normalized.includes('login') || normalized.includes('sign in') || normalized.includes('signup') || normalized.includes('account')) {
    return 'For account access, use the Login or Sign Up page. If email sign-in fails, try Google sign-in or verify that your Neon Auth account has been created correctly.'
  }

  if (normalized.includes('ai') || normalized.includes('detect') || normalized.includes('prediction')) {
    return 'The platform uses the prediction workflow to analyze uploaded road images and estimate pothole severity. After detection, you can generate a report and submit it for follow-up.'
  }

  if (normalized.includes('contact') || normalized.includes('support') || normalized.includes('help')) {
    return 'You can reach support from the Contact page. If your issue needs human follow-up, leave your details there and the team can respond directly.'
  }

  return 'I can help with RoadWatch account access, pothole reporting, prediction flow, report tracking, and support steps. If your issue needs a human follow-up, please use the Contact page.'
}

export const generateAIReport = async (
  complaintText: string,
  severity: string,
  location: { lat: number; lng: number },
  detectionResult: any
) => {
  if (!MANUS_API_KEY) {
    return {
      summary: 'AI report generation is not configured. Add VITE_MANUS_API_KEY to frontend/.env.local.',
      riskLevel: 'Unknown',
      recommendedAction: 'Configure the Manus API key and try again.',
      civicImpact: 'No automated analysis is available until the report service is configured.',
    }
  }

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
    Return ONLY a single valid JSON block, no markdown formatting or extra text.
  `

  try {
    // 1. Dispatch Task to Manus API
    const response = await fetch(MANUS_START_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-manus-api-key': MANUS_API_KEY
      },
      body: JSON.stringify({
        message: { content: prompt }
      })
    });

    const data = await response.json();
    
    if (!data.ok || !data.task_id) {
       throw new Error('Failed to start Manus task');
    }

    const taskId = data.task_id;

    // 2. Poll for completion
    let maxRetries = 40; // 40 * 3 seconds = 120s max timeout
    while (maxRetries > 0) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const pollRes = await fetch(`${MANUS_POLL_URL}?task_id=${taskId}&order=desc&limit=50`, {
        headers: {
          'x-manus-api-key': MANUS_API_KEY
        }
      });
      const pollData = await pollRes.json();

      if (pollData.ok && pollData.messages) {
        const isStopped = pollData.messages.some((m: any) => 
          m.status_update?.agent_status === 'stopped' || m.status_update?.agent_status === 'error'
        );

        if (isStopped) {
          // Extract text from the assistant messages
          const assistantMessages = pollData.messages
            .filter((m: any) => m.type === 'assistant_message' && m.assistant_message?.content)
            .map((m: any) => m.assistant_message.content)
            .reverse();
            
          const combinedText = assistantMessages.join(' ');
          
          // Pattern match for JSON
          const jsonMatch = combinedText.match(/\{[\s\S]*\}/);
          return jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: combinedText || 'Analysis complete.' };
        }
      }
      maxRetries--;
    }
    
    return { summary: 'Manus AI report generation timed out.' };
    
  } catch (error) {
    console.error('Manus API error:', error)
    return { summary: 'Unable to generate AI report at this time.' }
  }
}

export const generateChatResponse = async (message: string, conversationHistory: any[]) => {
  if (!OPENROUTER_API_KEY) {
    return buildFallbackSupportResponse(message)
  }

  const systemPrompt = `You are a helpful customer support agent for RoadWatch / Pothole AI, a platform for detecting and reporting road damage. 
Your primary job is to help the user and solve their queries regarding the platform, how to report a pothole, how the AI detection works, and basic troubleshooting.
If you are unable to answer or they need technical human assistance, politely inform them that you cannot help further and redirect them to the Contact Support page or tell them an administrator will follow up later. Keep your responses friendly, concise, and directly actionable.`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.message,
    })),
    {
      role: 'user',
      content: message,
    },
  ]

  try {
    const fallbackModels = [
      OPENROUTER_MODEL,
      'meta-llama/llama-3.3-8b-instruct:free',
      'openrouter/auto',
    ].filter((model, index, arr) => Boolean(model) && arr.indexOf(model) === index)

    let lastError = 'The assistant is temporarily unavailable.'

    for (const model of fallbackModels) {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'RoadWatch AI',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
        }),
      })

      const rawBody = await response.text()
      let data: any = null

      try {
        data = rawBody ? JSON.parse(rawBody) : null
      } catch {
        data = null
      }

      if (!response.ok) {
        lastError = data?.error?.message || `OpenRouter request failed with status ${response.status}.`
        continue
      }

      const content = extractAssistantText(data?.choices?.[0]?.message?.content)
      if (content) {
        return content
      }

      lastError = data?.error?.message || 'The assistant returned an empty response.'
    }

    if (lastError.toLowerCase().includes('unauthorized') || lastError.toLowerCase().includes('user not found')) {
      return buildFallbackSupportResponse(message)
    }

    return `${lastError} Please try again or use Contact Support if you still need help.`
  } catch (error) {
    console.error('OpenRouter Chat API error:', error)
    return buildFallbackSupportResponse(message)
  }
}
