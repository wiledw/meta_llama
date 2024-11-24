# README
## Inspiration
Since COVID, there has been a growing interest in travel, with an increasing demand for authentic local experiences. However, language barriers often restrict access to localized, language-specific information. At the same time, the rapid advancements in LLM models, particularly Llama, have opened up new possibilities for overcoming these challenges and enhancing the travel experience.
## What it does
Our platform enables users to input their queries, leveraging Llama and web search to generate tailored recommendations for spots that match their interests. The system focuses on uncovering hidden gems in the community, such as family-owned restaurants offering authentic local cuisine and local craft shops. It retrieves and summarizes reviews in the local language from Google Maps for each recommended spot, providing users with insights. Additionally, the platform generates a localized rating based on these reviews to help users identify and avoid tourist traps. Users can save their favorite recommendations, which can be used to create personalized itineraries with weather data from the Open-Meteo API and transportation data from the Google Directions API.
## Impacts:
- Economical:
  - Uncovering hidden gems places that are popular among locals but less visible to mainstream tourism
  - Supporting local businesses by providing tourists fresh and authentic experiences that go beyond guidebooks
- Cultural:
  - Enabling users to experience authentic local culture and foster meaningful interactions with communities
This message was deleted.

## How We Built It

### 1. **Frontend**
   - **Tools**: React, GoogleOUATH, Vercel
   - **Features**:
     - User-friendly interface to input travel ideas or upload/take photos.
     - Displays travel recommendations and detailed insights in the user's preferred language.
     - Visualizes itinerary intuitively.
     - Handles secure user authentication.

### 2. **Backend**
   - **Tools**: Flask, Google App Engine
   - **Features**:
     - Manages data flow between the frontend, LLM, and remote APIs.

### 3. **Database**
   - **Tools**: Supabase
   - **Features**:
     - Save and manage saved travel spot recommendations and itinerary data

### 4. **Web Scraping**
   - **Tools**: Brave Search API, BeautifulSoup
   - **Features**:
     - Collects region-specific and language-specific information from authentic websites.
     - Focuses on local forums, reviews, and community insights to ensure recommendations are culturally relevant.

### 5. **LLM Integration**
   - **Models**: Groq, Nebius, LlamaIndex, Llama 3.1 & 3.2 
   - **Features**:
     - Understand user inputs and photos for intent and target region using visual-language models.
     - Translates web search query into the local language of the destination using text based models.
     - Analyzes and summarizes scraped data to generate curated travel lists using RAG.
     - Translates the curated information into the user's preferred language.

### 6. **Google Maps Integration**
   - **Features**:
     - Visualizes recommended locations on a map.
     - Collect ratings, reviews, photos and local community insights for each place.
## Challenges we ran into
- Initially, we planned to focus solely on the local spot recommendation feature. However, we later decided to incorporate an itinerary feature, which led to challenges in integrating the backend with the frontend due to time constraints. Fortunately, we managed to make it work.
- The pipeline execution took significantly longer than anticipated. After investigating the issue, we discovered that it was caused by multiple HTTP requests being sent simultaneously.
## Accomplishments that We're Proud of
- Developed and successfully implemented various functionalities using Llama 3 models, including local spot recommendations, user review retrieval, and personalized itinerary generation.
- Successfully deployed our web app and RAG pipeline to GCP, seamlessly integrating both components.
## What's Next
- Interactive itinerary generation: Dynamically adjust the itinerary based on user input and provide integrated transport and accessibility information.
- Optimize web scraping: Store redundant scraped results in the database to avoid redundant web scraping if the data already exists in the database
- Enable user reviews: Enable users to submit reviews for visited spots, reducing reliance on Google reviews.

