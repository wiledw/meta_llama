import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { placeName } = await req.json();
    
    const detailsFormData = new FormData();
    detailsFormData.append('place', placeName);
    
    const detailsResponse = await fetch(
      'https://metallama3-dot-gen-lang-client-0695819598.ue.r.appspot.com/get_detail',
      {
        method: 'POST',
        body: detailsFormData,
      }
    );
    
    if (!detailsResponse.ok) {
      throw new Error(`Failed to get details for ${placeName}`);
    }
    
    const details = await detailsResponse.json();
    return NextResponse.json(details);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 