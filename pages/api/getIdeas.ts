import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const formData = await req.formData();
    const prompt = formData.get('prompt');
    const image = formData.get('image');

    if (!prompt && !image) {
      return NextResponse.json(
        { error: 'Either prompt or image is required' },
        { status: 400 }
      );
    }

    // First API call to get ideas
    const ideasResponse = await fetch(
      'https://metallama3-dot-gen-lang-client-0695819598.ue.r.appspot.com/get_ideas',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!ideasResponse.ok) {
      throw new Error(`API error: ${ideasResponse.status}`);
    }
    const ideasData = await ideasResponse.json();
    return NextResponse.json(ideasData);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}