export async function chatWithGroq(messages, options = {}) {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      model: options.model,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Groq request failed');
  }

  return response.json();
}

export const GROQ_DEFAULT_MODEL = 'llama-3.3-70b-versatile';
