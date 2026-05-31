const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY
const OPENROUTER_URL = import.meta.env.VITE_OPENROUTER_URL ?? 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_MODEL = import.meta.env.VITE_OPENROUTER_MODEL ?? 'google/gemma-3-27b-it:free'

const MANUS_API_KEY = import.meta.env.VITE_MANUS_API_KEY
const MANUS_START_URL = import.meta.env.VITE_MANUS_START_URL ?? 'https://api.manus.ai/v2/task.create'
const MANUS_POLL_URL = import.meta.env.VITE_MANUS_POLL_URL ?? 'https://api.manus.ai/v2/task.listMessages'
const CHAT_TIMEOUT_MS = Number(import.meta.env.VITE_CHAT_TIMEOUT_MS ?? 8000)
const REPORT_POLL_ATTEMPTS = Number(import.meta.env.VITE_REPORT_POLL_ATTEMPTS ?? 8)
const REPORT_POLL_INTERVAL_MS = Number(import.meta.env.VITE_REPORT_POLL_INTERVAL_MS ?? 2000)

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
    return 'To file a road report, sign in and open the Prediction page. Upload a road image, review the detection, then submit the report so it reaches the tracking workflow.'
  }

  if (normalized.includes('track') || normalized.includes('status') || normalized.includes('history')) {
    return 'You can track your reports from your profile dashboard. Recent submissions, progress updates, and resolved reports are shown there once the report is saved successfully.'
  }

  if (normalized.includes('login') || normalized.includes('sign in') || normalized.includes('signup') || normalized.includes('account')) {
    return 'For account access, use the Login or Sign Up page. If email sign-in fails, try Google sign-in or verify that your Neon Auth account has been created correctly.'
  }

  if (normalized.includes('ai') || normalized.includes('detect') || normalized.includes('prediction')) {
    return 'The platform uses the prediction workflow to analyze uploaded road images and estimate road damage severity. After detection, you can generate a report and submit it for follow-up.'
  }

  if (normalized.includes('contact') || normalized.includes('support') || normalized.includes('help')) {
    return 'You can reach support from the Contact page. If your issue needs human follow-up, leave your details there and the team can respond directly.'
  }

  return 'I can help with RoadWatch AI account access, road monitoring and governance reporting, prediction flow, report tracking, and support steps. If your issue needs a human follow-up, please use the Contact page.'
}

const withTimeout = async (url: string, options: RequestInit, timeoutMs: number) => {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    window.clearTimeout(timeout)
  }
}

const buildFastMaintenanceReport = (
  complaintText: string,
  severity: string,
  location: { lat: number; lng: number },
  detectionResult: any
) => {
  const normalizedSeverity = ['Low', 'Medium', 'High', 'Critical'].includes(severity) ? severity : 'Medium'
  const confidence = detectionResult?.confidence ?? 'unknown'
  const areaRatio = detectionResult?.metrics?.area_ratio ?? detectionResult?.area_ratio
  const areaText = typeof areaRatio === 'number' ? `${(areaRatio * 100).toFixed(2)}% of the analyzed frame` : 'not available'

  return {
    summary: `A ${normalizedSeverity.toLowerCase()} priority pothole report was generated near ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}. The detector confidence is ${confidence}% and the affected surface estimate is ${areaText}.`,
    riskLevel: normalizedSeverity,
    recommendedAction: normalizedSeverity === 'Critical' || normalizedSeverity === 'High'
      ? 'Prioritize inspection and temporary barricading before repair scheduling.'
      : 'Schedule field verification and batch repair with nearby road defects.',
    recommendedActions: [
      'Verify dimensions and lane position on site.',
      'Capture before/after repair photos.',
      'Update the report status after assignment and completion.',
    ],
    civicImpact: complaintText || 'Potential ride discomfort, vehicle damage, and two-wheeler safety risk if left unresolved.',
    fieldChecklist: [
      'Confirm exact GPS point and road direction.',
      'Measure pothole width, length, and depth.',
      'Check drainage or repeated waterlogging nearby.',
      'Assess traffic control needs before repair.',
    ],
    timeline: [
      { phase: 'Triage', when: 'Within 24 hours', actions: ['Review image, severity, and location metadata.'] },
      { phase: 'Field verification', when: '1-2 days', actions: ['Inspect site and assign repair crew if confirmed.'] },
      { phase: 'Repair closure', when: 'Based on severity', actions: ['Patch surface, upload proof, and mark resolved.'] },
    ],
    assumptions: [
      'Severity is estimated from the uploaded image and detector metrics.',
      'Location depends on browser geolocation permission and device accuracy.',
    ],
  }
}

export const generateAIReportWithManus = async (
  complaintText: string,
  severity: string,
  location: { lat: number; lng: number },
  detectionResult: any
) => {
  if (!MANUS_API_KEY) {
    return buildFastMaintenanceReport(complaintText, severity, location, detectionResult)
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
    Return ONLY a single valid JSON object (no markdown, no code fences, no extra text) with EXACTLY these fields:

    - "summary": string (2-3 sentences, executive-level)
    - "riskLevel": string (one of: "Low" | "Medium" | "High" | "Critical")
    - "recommendedAction": string (one primary actionable action)
    - "recommendedActions": string[] (2-5 supporting actions)
    - "civicImpact": string (public-safety/traffic impact)
    - "fieldChecklist": string[] (2-6 items the inspector should verify on-site)
    - "timeline": Array<{ phase: string, when: string, actions: string[] }>
    - "assumptions": string[] (2-5 assumptions made from available data)

    Ensure the tone is professional, objective, and actionable for municipal authorities.
  `

  try {
    // 1. Dispatch Task to Manus API
    const response = await withTimeout(MANUS_START_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-manus-api-key': MANUS_API_KEY
      },
      body: JSON.stringify({
        message: { content: prompt }
      })
    }, CHAT_TIMEOUT_MS);

    const data = await response.json();
    
    if (!data.ok || !data.task_id) {
       throw new Error('Failed to start Manus task');
    }

    const taskId = data.task_id;

    // 2. Poll for completion
    let maxRetries = REPORT_POLL_ATTEMPTS;
    while (maxRetries > 0) {
      await new Promise(resolve => setTimeout(resolve, REPORT_POLL_INTERVAL_MS));
      
      const pollRes = await withTimeout(`${MANUS_POLL_URL}?task_id=${taskId}&order=desc&limit=50`, {
        headers: {
          'x-manus-api-key': MANUS_API_KEY
        }
      }, CHAT_TIMEOUT_MS);
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
            
          const combinedText = assistantMessages.join(' ').trim();

          const extractJsonObject = (text: string) => {
            const cleaned = text
              .replace(/```json/gi, '')
              .replace(/```/g, '')
              .trim();
            const start = cleaned.indexOf('{');
            const end = cleaned.lastIndexOf('}');
            if (start === -1 || end === -1 || end <= start) return null;
            return cleaned.slice(start, end + 1);
          }

          const jsonText = extractJsonObject(combinedText);
          if (!jsonText) {
            return {
              summary: combinedText || 'Analysis complete.',
              riskLevel: 'Unknown',
              recommendedAction: 'Review required',
              recommendedActions: [],
              civicImpact: '',
              fieldChecklist: [],
              timeline: [],
              assumptions: [],
            }
          }

          let parsed: any = null;
          try {
            parsed = JSON.parse(jsonText);
          } catch {
            return {
              summary: combinedText || 'Analysis complete.',
              riskLevel: 'Unknown',
              recommendedAction: 'Review required',
              recommendedActions: [],
              civicImpact: '',
              fieldChecklist: [],
              timeline: [],
              assumptions: [],
            }
          }

          const riskAllowed = new Set(['Low', 'Medium', 'High', 'Critical']);
          const riskLevel = typeof parsed?.riskLevel === 'string' && riskAllowed.has(parsed.riskLevel)
            ? parsed.riskLevel
            : 'Unknown'

          const recommendedAction =
            typeof parsed?.recommendedAction === 'string'
              ? parsed.recommendedAction
              : (Array.isArray(parsed?.recommendedActions) ? parsed.recommendedActions?.[0] : null)
              || 'Review required'

          return {
            summary: typeof parsed?.summary === 'string' ? parsed.summary : (combinedText || 'Analysis complete.'),
            riskLevel,
            recommendedAction,
            recommendedActions: Array.isArray(parsed?.recommendedActions) ? parsed.recommendedActions : [],
            civicImpact: typeof parsed?.civicImpact === 'string' ? parsed.civicImpact : '',
            fieldChecklist: Array.isArray(parsed?.fieldChecklist) ? parsed.fieldChecklist : [],
            timeline: Array.isArray(parsed?.timeline) ? parsed.timeline : [],
            assumptions: Array.isArray(parsed?.assumptions) ? parsed.assumptions : [],
          };
        }
      }
      maxRetries--;
    }
    
    return buildFastMaintenanceReport(complaintText, severity, location, detectionResult);
    
  } catch (error) {
    console.error('Manus API error:', error)
    return buildFastMaintenanceReport(complaintText, severity, location, detectionResult)
  }
}

export const generateChatResponseWithOpenRouter = async (message: string, conversationHistory: any[]) => {
  if (!OPENROUTER_API_KEY) {
    return buildFallbackSupportResponse(message)
  }

  const systemPrompt = `You are a helpful support agent for RoadWatch AI (an Intelligent Road Monitoring & Governance Platform). 
Keep all your answers EXTREMELY short, sweet, and to the point (1-2 sentences max). You have full context on Road Reports, Severity Analysis, Governance Workflows, Authority Assignment, RoadSoS emergency support layers, and the Public Transparency Dashboard.
If you cannot handle a request, or if the user needs technical assistance, immediately say: "I cannot help with that. Please forward your request to our Contact page so our team can assist you directly."`

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-8).map((msg) => ({
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
      const response = await withTimeout(OPENROUTER_URL, {
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
      }, CHAT_TIMEOUT_MS)

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
