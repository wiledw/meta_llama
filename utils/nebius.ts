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
    console.log("Response:", response);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Unexpected API response structure');
    }

    const responseText = data.choices[0].message.content;
    
    // Extract JSON object from the response text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
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