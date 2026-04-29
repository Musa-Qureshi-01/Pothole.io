import type { PotholePredictionResponse } from '../types/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export async function predict(image: File): Promise<PotholePredictionResponse> {
  const form = new FormData();
  form.append('image', image);

  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      body: form,
    });

    if (res.ok) {
      return res.json() as Promise<PotholePredictionResponse>;
    }
  } catch (err) {
    console.warn('Backend unavailable, falling back to Gemini Vision...', err);
  }

  // --- Gemini Vision Fallback (for Deployment) ---
  if (!OPENROUTER_API_KEY) {
    throw new Error('Detection failed: Backend is offline and no AI Fallback Key (VITE_OPENROUTER_API_KEY) was found.');
  }

  const base64Image = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(image);
  });

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analyze this road image for potholes. If a pothole is visible, return ONLY a JSON object with: {"is_pothole": true, "confidence": number (0-100), "area_pixels": number (e.g. 5000), "area_ratio": number (0-1)}. If no pothole, return {"is_pothole": false}. No extra text.' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      response_format: { type: 'json_object' }
    })
  });

  const data = await response.json();
  const aiResult = JSON.parse(data.choices[0].message.content);

  return {
    is_pothole: aiResult.is_pothole,
    confidence: aiResult.confidence ?? 0,
    message: aiResult.is_pothole ? 'Pothole detected via AI Fallback' : 'No potholes detected.',
    metrics: aiResult.is_pothole ? { area_pixels: aiResult.area_pixels, area_ratio: aiResult.area_ratio } : null,
    mask_png_base64: null, // AI fallback doesn't generate segmentation masks
    overlay_png_base64: `data:image/jpeg;base64,${base64Image}` // Use original image as overlay
  };
}
