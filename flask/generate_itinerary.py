#%%
import pytz
# import datetime
from datetime import datetime
import requests
import time
# import networkx as nx
import os
# import matplotlib.pyplot as plt
# from networkx.algorithms.approximation import traveling_salesman_problem
from dotenv import load_dotenv
import json
from groq import Groq
import ast

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
#%%
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
model_name = "llama-3.2-90b-vision-preview"
#%%
def pretty_json(json_data):

    # Convert the Python dictionary back to a nicely formatted JSON string
    formatted_json = json.dumps(json_data, indent=4)

    return formatted_json
#%%
def get_step_data(transit_step):
    return {
        "departure_stop": transit_step["transit_details"]["departure_stop"]["name"],
        "departure_time": transit_step["transit_details"]["departure_time"]["value"],
        "arrival_stop": transit_step["transit_details"]["arrival_stop"]["name"],
        "arrival_time": transit_step["transit_details"]["arrival_time"]["value"],
        "line_name": transit_step["transit_details"]["line"]["name"],
        "vehicle_type": transit_step["transit_details"]["line"]["vehicle"]["name"],
    }
#%%
def get_dir_data(origin, destination, start_datetime):
    url = (
        f"https://maps.googleapis.com/maps/api/directions/json?"
        f"origin={origin}&destination={destination}&departure_time={start_datetime}&mode=transit&key={GOOGLE_API_KEY}"
    )
    response = requests.get(url)
    data = response.json()
    steps = [step for step in data["routes"][0]["legs"][0]["steps"] if step["travel_mode"] == "TRANSIT"]
    # print(pretty_json(data))
    if data["status"] == "OK":
        return {
            # "overall_departure_time": data["routes"][0]["legs"][0]["departure_time"]["value"],
            # "overall_arrival_time": data["routes"][0]["legs"][0]["arrival_time"]["value"],
            "overall_duration": data["routes"][0]["legs"][0]["duration"]["value"],
            "steps": steps
        }
        # return data['rows'][0]['elements'][0]["duration_in_traffic"]["value"]  # Travel time in seconds
    else:
        print(f"Error: {data['status']} for route {origin} -> {destination}")
        print(response.text)
        return None
#%%
def get_travel_time(origin, destination, start_datetime):
    dir_data = get_dir_data(origin, destination, start_datetime)
    if dir_data is not None:
        return dir_data["overall_duration"]
    else:
        return None
#%%


def get_itinerary_sub(chosen_places):
    # chosen_places = ['Toronto International Airport', 'CN Tower', 'Casa Loma', 'Hockey Hall of Fame', 'St. Lawrence Market', 'Royal Ontario Museum']
    stay_times = [0, 2, 2, 2, 2, 2]  # In hours
    toronto_tz = pytz.timezone('America/Toronto')
    departure_str = "2024-11-26 09:00:00"
    departure_timestamp = int(datetime.strptime(departure_str, "%Y-%m-%d %H:%M:%S").timestamp())
    print(departure_timestamp)
    #%%
    places_dict = {i: place for i, place in enumerate(chosen_places)}
    curr_i = 0
    curr_time = departure_timestamp
    res = ""
    while len(places_dict) > 1:
        del places_dict[curr_i]
        min_value = float('inf')
        next_place = None
        chosen_data = None
        for place in places_dict.values():
            dir_data = get_dir_data(chosen_places[curr_i], place, curr_time)
            t = dir_data["overall_duration"]
            if t < min_value:
                min_value = t
                next_place = place
                chosen_data = dir_data
        curr_time += stay_times[curr_i] * 3600
        for step in chosen_data["steps"]:
            step_data = get_step_data(step)
            res += f"\tFrom {step_data['departure_stop']} to {step_data['arrival_stop']} on {step_data['line_name']}\n"
        time_needed = chosen_data["overall_duration"]
        curr_time_formatted = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(curr_time))
        res += f"From {chosen_places[curr_i]} to {next_place} departing at {curr_time_formatted}\n"
        curr_time += time_needed
        curr_i = chosen_places.index(next_place)
        res += f"Staying at {chosen_places[curr_i]} for {stay_times[curr_i]} hours\n"
    print(res)
    #%%
    itinerary_prompt = f"""
    Here's an example of an itinerary:
    Itenerary for a day trip to Hong Kong on 2024-11-26
    09:00 - Depart from Hong Kong International Airport
        09:09 - Take the Airport Express From Airport to Tsing Yi Station
        09:24 - Take Bus 41 From Tsing Yi Square to Kowloon Station
    10:24 - Arrived at Elements shopping mall. Stay for 2 hours. You can do a lot here, including ...
        12:24 - Walk to M+ Museum
    12:30 - Arrive at M+ Museum. Stay for 2 hours. You can see the latest exhibitions and ...
    etc.
    
    Here's the information needed for your itinerary: 
    {res}

    Make sure you include every single detail in the information provided, including every transit to take from the first to last stop, departure, arrival stops and departure time for each transit. For the timestamp, only include hour and minute. Create an itinerary with this information. For each attraction the user will stay for some time, include a one to two line description about the attraction. Only indent if the user walks or takes a transit."""
    #%%
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user",
                   "content": itinerary_prompt},],
        temperature=0,
    )
    itineraray_res = response.choices[0].message.content
    print(itineraray_res)
    #%%
    format_prompt = f"""
    Here's the itinerary:
    {itineraray_res}
    
    Format the itinerary into a json object with "itinerary" as the top key and the value as a list of dictionaries. Apart from "itinerary", the top key should also include "title", ie the first line. Each dictionary should have the following keys: "Timestamp", "Description" and "transit". Hint: the '-' in each line separates timestamp and description. The transit key is a "True" or "False" value indicating whether the user is taking a transit or not. If there is an indentation on that line, transit should be "True" otherwise "False". The timestamp should be in the format HH:MM. The description should be a string. The itinerary should be in chronological order.       
    Return only a json object          
    """
    #%%
    response = client.chat.completions.create(
        model=model_name,
        messages=[{"role": "user",
                   "content": format_prompt},],
        temperature=0,
    )
    format_res = response.choices[0].message.content
    print(format_res)
    print('\n---\n')
    format_res = format_res.replace("```json",  "")
    format_res = format_res.replace("```", "")
    format_res = format_res.strip()
    print(format_res)

    output = ast.literal_eval(format_res)
    print(output)
    return output


if __name__ == '__main__':
    chosen_places = ['Toronto International Airport', 'CN Tower', 'Casa Loma', 'Hockey Hall of Fame', 'St. Lawrence Market', 'Royal Ontario Museum']
    res = get_itinerary_sub(chosen_places)
    print(type(res))
