import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.NEBIUS_API_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { placeName } = req.body;
    const API_URL = 'https://api.studio.nebius.ai/v1/chat/completions';
    const prompt = `Provide accessibility information for ${placeName}. Include details on physical, sensory, cognitive accessibility, and inclusive amenities. Output the information in JSON format with only the following keys: Physical Accessibility, Sensory Accessibility, Cognitive Accessibility, Inclusive Amenities. Set the values to true or false based on the availability of these features.`;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Meta-Llama-3.1-405B-Instruct",
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides accessibility information in JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0,
        max_tokens: 200
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Nebius API Error:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 