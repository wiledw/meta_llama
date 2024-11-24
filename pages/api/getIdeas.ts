import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
    externalResolver: true,
    maxDuration: 300, 
  },
};

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
    
    // Extract raw place names
    const placeNames = Object.values(ideasData.place_details || {})
      .map((place: any) => place.name);
    
    console.log("Place names being sent:", placeNames);
    
    // Make parallel requests for each place
    const detailsPromises = placeNames.map(async (rawName: string) => {
      const detailsFormData = new FormData();
      detailsFormData.append('place', rawName);
      
      console.log('Sending request for place:', rawName);
      
      const detailsResponse = await fetch(
        'https://metallama3-dot-gen-lang-client-0695819598.ue.r.appspot.com/get_detail',
        {
          method: 'POST',
          body: detailsFormData,
        }
      );
      
      if (!detailsResponse.ok) {
        console.error(`Failed to get details for ${rawName}`);
        return null;
      }
      
      return detailsResponse.json();
    });

    // Wait for all detail requests to complete
    const detailsResults2 = await Promise.all(detailsPromises);
    console.log("Details results:", detailsResults2);

    // Create a copy of ideasData to modify
    const modifiedData = { ...ideasData };

    // Loop through the details and add them to the corresponding places
    Object.keys(modifiedData.place_details).forEach((key, index) => {
      const details = detailsResults2[index];
      if (details) {
        modifiedData.place_details[key] = {
          ...modifiedData.place_details[key],
          translated_description: details.description,
          translated_review_summary: details.review_summary
        };
      }
    });
    return NextResponse.json(modifiedData);

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}