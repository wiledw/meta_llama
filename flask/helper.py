import json
import os
import ast

import requests
from bs4 import BeautifulSoup
from groq import Groq
from llama_index.embeddings.openai import OpenAIEmbedding
from dotenv import load_dotenv
from llama_index.core.node_parser import LangchainNodeParser
from langchain.text_splitter import RecursiveCharacterTextSplitter
from llama_index.vector_stores.faiss import FaissVectorStore
from llama_index.core import VectorStoreIndex, Settings, StorageContext
from llama_index.llms.openai_like import OpenAILike
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.readers import StringIterableReader
import faiss

# Load environment variables from .env file
load_dotenv()
# Access the variables
BRAVE_API_KEY = os.getenv("BRAVE_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_SEARCH_ENGINE_ID = os.getenv("GOOGLE_SEARCH_ENGINE_ID")

print('creating groq client')
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
model_name = "llama-3.2-90b-vision-preview"
model2_name = "meta-llama/Meta-Llama-3.1-70B-Instruct"
client2 = OpenAILike(
    model=model2_name,
    is_chat_model=True,
    api_base="https://api.studio.nebius.ai/v1/",
    api_key=os.environ.get("NEBIUS_API_KEY"),
    temperature=0,
)

# %%
# Set up embedding model and llm
embeddings = OpenAIEmbedding()
Settings.embed_model = embeddings
Settings.llm = client2
# %%
# Create Vector store and store chunks
faiss_dim = len(embeddings.get_text_embedding("Hello world"))
print("creating faiss index")
faiss_index = faiss.IndexFlatL2(faiss_dim)
print("creating vector store")
vector_store = FaissVectorStore(faiss_index=faiss_index)
print("creating storage context")
storage_context = StorageContext.from_defaults(vector_store=vector_store)
vector_index: None|VectorStoreIndex = None


place_details = {}
user_prompt = ""
user_language = ""


def get_travel_ideas(user_prompt_, enc_image=None):
    global vector_index, place_details, user_prompt, user_language
    user_prompt = user_prompt_
    '''LLM PART 1'''
    # %% md
    # ## 1. Provide travel idea along with destination
    # %%
    if enc_image is not None:
        photo_prompt = "Identify and name the main object in the photo and describe it in a short paragraph."
        photo_description = client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user",
                       "content": [
                           {"type": "text", "text": photo_prompt},
                           {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{enc_image}"}}
                       ]}],
            temperature=0,
        )
        photo_description = photo_description.choices[0].message.content
    else:
        photo_description = "No photo uploaded"
    print(photo_description)
    # %%
    assistant_prompt = f"""
    User prompt:
    {user_prompt}

    Descriptions of uploaded photos:
    {photo_description}

    Instructions:
    You are a travelling assistant. Find out what kind of places the user wants to visit by finding out keywords in the user prompt. If there are uploaded photos, try to find out how they relates to the user's intent and find key words in it. Next, create ONE concise query you'd put in a search engine to find suitable local places which are less-known to tourists for the user to visit according to the user's requests. For example, if the user wants to visit museums in London, the search query would be "London local museums". Output this ONE query in the language used in the user's travel destination. ONLY output the query and nothing else. DO NOT include your thought process. 
    """
    # %%
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user",
                   "content": assistant_prompt}, ],
        temperature=0,
    )
    search_query = response.choices[0].message.content
    print(search_query)
    # %%
    p2 = f"Given this search query: {search_query}, locate keywords in it and shorten it to around 6 words. ONLY output the shortened search query and nothing else."
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user",
                   "content": p2}, ]

    )
    search_query_short = response.choices[0].message.content
    print(search_query_short)
    # %%
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user",
                   "content": f"User prompt:\n{user_prompt}\n\nGet the language of the user prompt. Return only this language and nothing else, so return ONE word."}, ]

    )
    user_language = response.choices[0].message.content
    print(user_language)
    # %%
    search_prompt = f"""Given the list of languages choose one that you want to find search results in. ONLY provide the language code.

    User prompt:
    {user_prompt}

    The list of languages:
    - en
    - fr
    - de
    - es
    - lang_it
    - pt-pt
    - pt-br
    - th
    - hi
    """
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user",
                   "content": search_prompt}, ]

    )
    language_code = response.choices[0].message.content
    print(language_code)
    # %%
    coun_code_prompt = f"""Given the list of countries choose one that you want to find search results in. ONLY provide the countries.

    User prompt:
    {user_prompt}

    The list of countries:
    GB, US, CA, NZ, AU, BR, FR, DE, ES, IT, PT, BR, IN
    """
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user",
                   "content": coun_code_prompt}, ],
        temperature=0
    )
    country_code = response.choices[0].message.content
    print(country_code)
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user",
                   "content": f"Here is user prompt: {user_prompt}\n\nWhich country is the user insterested in? Only output country name and nothing else."}, ],
        temperature=0,
    )
    country_name = response.choices[0].message.content
    print(country_name)

    '''SEARCH PART'''
    # %% md
    # # Part 1: Search places
    # %%
    google_search_query = search_query
    country = country_code
    country_name = country_name
    language = language_code

    # %% md
    # ## Step 1: Use Brave Search API to get search results
    # %%
    # Brave Search Config
    search_lang = language.lower()

    # %%
    def brave_search_rest(key, country, lang):
        url = "https://api.search.brave.com/res/v1/web/search"
        params = {
            "q": key,
            "country": country,
            "search_lang": lang,
            "count": 5,
            # "freshness": "py",
            "result_filter": "web"
        }
        headers = {
            "X-Subscription-Token": BRAVE_API_KEY
        }
        result = requests.get(url, params, headers=headers)
        if result.status_code != 200:
            print(f"Error: {result.status_code}")
            print(result.text)
            return {}
        else:
            return result.json()

    # %%
    search_results = brave_search_rest(google_search_query, country, search_lang)
    # %%
    # search_results
    # %%
    search_results_list = search_results["web"]["results"]
    brave_search_urls = [item["url"] for item in search_results_list]
    # %% md
    #
    # %% md
    # ## Step 2: Use BeautifulSoup to scape the links
    # %%
    # We use brave
    urls = brave_search_urls
    # %%

    # %%
    def clean_text(text):
        # Get text and clean it
        lines = (line.strip() for line in text.splitlines())
        text = '\n'.join(chunk for chunk in lines if chunk)
        return text

    # %%
    def scape_website(url):
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        }
        response = requests.get(url, headers=headers)
        print('Loaded', url)
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            print(response.text)
            return ""
        response.encoding = 'utf-8'  # Ensure the correct encoding
        soup = BeautifulSoup(response.content, 'html.parser', from_encoding='utf-8')
        text = soup.get_text()
        text = clean_text(text)
        return text

    # %%
    contents = [scape_website(url) for url in urls]

    '''LLM PART'''

    # ## 2. Set up RAG for scraped contents
    # %%
    # Split web content into chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=32)
    chunks_text = []
    for i, content in enumerate(contents):
        chunks_text.append(splitter.split_text(content))
    parser = LangchainNodeParser(splitter)
    content_docs = StringIterableReader().load_data(texts=contents)
    print(len(content_docs))
    chunks = parser.get_nodes_from_documents(content_docs)
    print(len(chunks))

    # Create Vector store and store chunks
    faiss_dim = len(embeddings.get_text_embedding("Hello world"))
    print("creating faiss index")
    faiss_index = faiss.IndexFlatL2(faiss_dim)
    print("creating vector store")
    vector_store = FaissVectorStore(faiss_index=faiss_index)
    print("creating storage context")
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    vector_index = VectorStoreIndex(chunks, storage_context=storage_context)


    # ## 3. Extract all recommended travel spots
    # %%
    num_chunks = 100
    res_str_list = []
    for chunk in chunks_text:
        docs_text = f"\n{'-' * 100}\n".join([f"Chunk {i + 1}:\n\n" + d for i, d in enumerate(chunk[:num_chunks])])
        context_prompt = docs_text
        loc_prompt = f"""
            User prompt:
            {user_prompt}

            Context prompt:
            {context_prompt}

            Extract at most 5 recommended travel spots the user wants to find according to the user prompt. 
            Only mention the NAMES of the spots and nothing else. 
            Every spot should be a physical location and NOT an event or carnival. 
            If the spot doesnt match the user's intent, DO NOT include that spot.
            DO NOT repeat any names. 
            Return a python list with each element containing a tuple, (spot name, category). 
            Category is the type of spot (eg restaurant, park, museum, zoo, shrine, statue, etc). 
            If there are no new spots in the context prompt, output an empty list. 
            Return only a python list.             
            """
        res_str_list.append(str(client2.complete(loc_prompt)))
    print(res_str_list)
    # %%
    res_list = []
    for res_str in res_str_list:
        formatted_res = ast.literal_eval(res_str)
        res_list.extend(formatted_res)
    res_set = set(res_list)
    print(res_set)


    '''SEARCH PART 2'''
    # %% md
    # # Part 2: Get place details by Google Map
    # %%
    extracted_places = list(res_set)[:10]
    print("EXTRACTED PLACES:")
    for place in extracted_places:
        print(place)
    # %%
    # Google Map
    field_mask = "places.name,places.editorialSummary,places.formattedAddress,places.location,places.rating,places.googleMapsUri,places.websiteUri,places.reviews.rating,places.reviews.text.text,places.photos.name,places.displayName.text,places.primaryTypeDisplayName"
    language_code = country_code.lower()
    regionCode = country_code
    country_name = country_name

    # %% md
    # ## Step 3: Use Google Map API to get reviews
    # %%
    def get_google_map_place_id(keyword, region_code, language_code):
        url = "https://places.googleapis.com/v1/places:searchText"
        params = {
            "textQuery": keyword,
            "regionCode": region_code,
            "languageCode": language_code,
            "rankPreference": "RELEVANCE",
        }
        headers = {
            "X-Goog-Api-Key": GOOGLE_API_KEY,
            "X-Goog-FieldMask": field_mask
        }
        result = requests.post(url, params, headers=headers)
        if result.status_code != 200:
            print(f"Error: {result.status_code}")
            # print(result.text)
            return {}
        else:
            return result.json()

    # %%
    def process_reviews(reviews):
        texts = []
        ratings = []
        for review in reviews:
            texts.append(review['text']['text'])
            ratings.append(review['rating'])
        return {
            "review_texts": texts,
            "local_ratings": sum(ratings) / len(ratings)
        }

    # %%
    def process_photos(photos):
        photo_names = [photo['name'] for photo in photos]
        return photo_names[0]

    # %%
    def get_formatted_place_details(keyword, region_code, language_code, country_name, category_name):
        keyword = keyword + ", " + category_name + ", " + country_name
        place_detail_ = get_google_map_place_id(keyword, region_code, language_code)
        place = place_detail_['places'][0]
        reviews = place['reviews']
        formatted_reviews = process_reviews(reviews)
        photo_names = process_photos(place['photos'])
        # print(place.keys())
        return {
            "name": place['displayName']['text'],
            "OrignalName": keyword,
            "primaryType": place.get('primaryTypeDisplayName', {'text': ''})['text'],
            "googleMapName": place['name'],
            "address": place['formattedAddress'],
            "location": place['location'],
            "googleMapsUri": place['googleMapsUri'],
            "websiteUri": place.get('websiteUri', ''),
            "globalRating": place['rating'],
            "localRating": formatted_reviews["local_ratings"],
            "googleMapPhoto": photo_names,
            "reviews": formatted_reviews["review_texts"],
        }

    # %%
    print("SEARCHING PLACES")
    place_details = {}
    for extracted_place, category_name in extracted_places:
        print((extracted_place, category_name))
        place_detail = get_formatted_place_details(extracted_place, regionCode, language_code, country_name,
                                                   category_name)
        place_details[place_detail['name']] = place_detail
        print((place_detail['name'], place_detail['primaryType']), place_detail['address'])

        # assert ("Paris" in place_detail['address']), f" {place_detail['name']} {place_detail['address']} Not in Paris"
        # assert ("restaurant" in place_detail['primaryType'].lower() or "grossiste" in place_detail['primaryType'].lower()), f" {place_detail['name']} {place_detail['primaryType']} Not a restaurant"
    # %%
    # len(place_details)
    # place_details.keys()
    # %%


    # for place_detail in place_details.values():
    #     print(place_detail['name'])
    #     with open(f"place_details_br/{place_detail['name']}.json", "w") as file:
    #         json.dump(place_detail, file, indent=4, ensure_ascii=False)
    # %%
    for place_detail in place_details.values():
        print(place_detail['googleMapsUri'])

    # %%

    # %% md
    # ## Step 4: Use Google Map API to get photos
    # %%
    def get_google_map_images(place):
        url = f"https://places.googleapis.com/v1/{place}/media"
        params = {
            "maxHeightPx": 400,
            "maxWidthPx": 400,
            "key": GOOGLE_API_KEY,
            "skipHttpRedirect": True
        }
        result = requests.get(url, params)
        if result.status_code != 200:
            print(f"Error: {result.status_code}")
            print(result.text)
            return ""
        else:
            return result.json()

    # %%
    for name, place_detail in place_details.items():
        place_details[name]["googleMapPhotoUri"] = get_google_map_images(place_detail['googleMapPhoto'])['photoUri']
        # display(Image(image))

    # save_results(place_details)

    # ## 4. Retrieve descriptions and reviews for every recommended spot
    # %%
    retriever = vector_index.as_retriever(similarity_top_k=2)
    query_engine = RetrieverQueryEngine(retriever=retriever)
    # %%
    short_desc_map = {}
    for restaurant in place_details.keys():
        retrieved_docs = retriever.retrieve(restaurant)
        retrieved_docs_text = f"\n{'-' * 100}\n".join(
            [f"Document {i + 1}:\n\n" + d.text for i, d in enumerate(retrieved_docs)])
        details_prompt = f"""
            User prompt:
            {user_prompt}

            Context prompt:
            {retrieved_docs_text}

            Give descriptions for the spot: "{restaurant}". Give a description in ten words. Translate to the user's language if necessary: {user_language}. Display only the description and nothing else.
        """
        description = str(query_engine.query(details_prompt))
        short_desc_map[restaurant] = description
        print(description)
        print('\n---\n')


    name_address_description = [
        {'name': rest,
        'address': place_details[rest]['address'],
        'short description': short_desc_map[rest]
        }  for rest in place_details.keys()]

    details_prompt = f"""
        User prompt:
        {user_prompt}

        name_address_description:
        {json.dumps(name_address_description, indent=4)}
        
        Give name_address_description triple, get only the name that are relevant to the user prompt
        Return a python list of the name. Remember to use double quotes to encapsulate each name string.
        Return only a python list without spacing.   
         
    """
    print(details_prompt)
    filtered_name = str(client2.complete(details_prompt))
    print(filtered_name)
    final_rests = ast.literal_eval(filtered_name)

    final_place_detail = {}
    for final_rest in final_rests[:6]:
        if final_rest in place_details.keys():
            final_place_detail[final_rest] = place_details[final_rest]
            final_place_detail[final_rest]["short_description"] = short_desc_map[final_rest]
    print('\n-FINALLLLLL--\n')
    print(final_place_detail)
    print('\n---\n')

    return final_place_detail

def get_description_and_reviews(restaurant):
    global vector_index, place_details, user_prompt, user_language
    print(f"user language: {user_language}")
    print("SAVED:", user_prompt, user_language)

    data = place_details[restaurant]
    print("DATA:")
    print(data)

    if vector_index is None:
        raise ValueError("Vector index is not initialized. Please run get_travel_ideas first.")

    retriever = vector_index.as_retriever(similarity_top_k=2)
    query_engine = RetrieverQueryEngine(retriever=retriever)

    # %%

    retrieved_docs = retriever.retrieve(restaurant)
    retrieved_docs_text = f"\n{'-' * 100}\n".join(
        [f"Document {i + 1}:\n\n" + d.text for i, d in enumerate(retrieved_docs)])
    details_prompt = f"""
        User prompt:
        {user_prompt}

        Context prompt:
        {retrieved_docs_text}

        Give descriptions for the spot: "{restaurant}". Give a description in one paragraph. Translate to the user's language if necessary: {user_language}. Display only the description and nothing else.
    """
    description = str(query_engine.query(details_prompt))
    print(description)
    print('\n---\n')
    # %%

    reviews = data.get("reviews", [])
    review_text = "\n\n".join([r for r in reviews])
    review_prompt = f"""
        Reviews:
        {review_text}

        Give a summary of the reviews for the spot: {restaurant}. Translate to the user's language: {user_language}. Display ONLY the summary and nothing else. Don't say "here's the summary" or anything similar.
    """
    review_summary = str(query_engine.query(review_prompt))
    print(f"{restaurant}: Rating: {data.get('localRating')}/5\n\n")
    print(review_summary)
    print('\n---\n')

    return description, review_summary
