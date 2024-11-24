import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { places } = await req.json();

    if (!Array.isArray(places) || places.length === 0) {
      return NextResponse.json(
        { error: 'Places array is required and must not be empty' },
        { status: 400 }
      );
    }

    const response = await fetch(
      'https://metallama3-dot-gen-lang-client-0695819598.ue.r.appspot.com/get_itinerary',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ places }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate itinerary' },
      { status: 500 }
    );
  }
} 