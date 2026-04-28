const OPENROUTER_API_KEY = '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';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MANUS_API_KEY = 'sk-KPj1Psx-aSL2H27NP7pCrmXBfDXqYXPakbzM9iwIXrIkJLcUhYJNtnQ38Z5W21bNSJ-P1CX58rgoQnnJfgXnNz_GMiCi';
const MANUS_START_URL = 'https://api.manus.ai/v2/task.create';
const MANUS_POLL_URL = 'https://api.manus.ai/v2/task.listMessages';

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
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'RoadWatch AI',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-27b-it:free',
        messages: messages,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Sorry, I could not process that. Please try again.';
  } catch (error) {
    console.error('OpenRouter Chat API error:', error)
    return 'I encountered an error connecting to the agent network. Please try again.'
  }
}
