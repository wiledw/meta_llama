const getAccessibilityInfo = async (placeName: string) => {
  try {
    console.log("Fetching accessibility info for:", placeName);
    const response = await fetch('/api/accessibility', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ placeName })
    });
    console.log("Response status:", response.status);

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.error('Received non-JSON response:', await response.text());
      throw new Error('Expected JSON response but got ' + contentType);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      throw new Error('Invalid JSON response');
    }
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected response structure:', data);
      throw new Error('Unexpected API response structure');
    }

    const responseText = data.choices[0].message.content;
    
    // Extract JSON object from the response text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', responseText);
      throw new Error('No valid JSON found in response');
    }

    const jsonString = jsonMatch[0];
    
    try {
      const parsedData = JSON.parse(jsonString);
      
      // Validate the structure
      const requiredKeys = [
        "Physical Accessibility",
        "Sensory Accessibility",
        "Cognitive Accessibility",
        "Inclusive Amenities"
      ];

      const hasAllKeys = requiredKeys.every(key => 
        typeof parsedData[key] === 'boolean'
      );

      if (!hasAllKeys) {
        console.error('Invalid data structure:', parsedData);
        throw new Error('Invalid data structure');
      }

      return parsedData;
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return {
        "Physical Accessibility": false,
        "Sensory Accessibility": false,
        "Cognitive Accessibility": false,
        "Inclusive Amenities": false
      };
    }
  } catch (error) {
    console.error('Error fetching accessibility info:', error);
    return {
      "Physical Accessibility": false,
      "Sensory Accessibility": false,
      "Cognitive Accessibility": false,
      "Inclusive Amenities": false
    };
  }
};

export { getAccessibilityInfo }; 