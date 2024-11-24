import base64
import datetime
import traceback
from io import BytesIO
from dotenv import load_dotenv
from flask import Flask, render_template, make_response, send_file, request, jsonify
from helper import *
app = Flask(__name__)

load_dotenv()


BUCKET_NAME = "beta_meta_llama"
SOURCE_FILE_NAME = "assets/upload.jpg"
DESTINATION_BLOB_NAME = "upload.jpg"
SOURCE_BLOB_NAME = "download.jpg"
DESTINATION_FILE_NAME = "assets/download.jpg"

print("SERVER STARTED")

@app.route("/")
def root():
    # For the sake of example, use static information to inflate the template.
    # This will be replaced with real information in later steps.
    dummy_times = [
        datetime.datetime(2018, 1, 1, 10, 0, 0),
        datetime.datetime(2018, 1, 2, 10, 30, 0),
        datetime.datetime(2018, 1, 3, 11, 0, 0),
    ]

    return render_template("index.html", times=dummy_times)

@app.route("/test")
def test():
    return {
        "message": "Hello, World!",
        "timestamp": datetime.datetime.now().isoformat(),
        "status": "ok",
    }

@app.route("/get_ideas", methods=['POST'])
def get_ideas():
    description = request.form.get('prompt')
    if 'image' in request.files and request.files['image'] is not None:
        image = request.files['image']
        image_blob = image.read()
        encoded_image = base64.b64encode(image_blob).decode('utf-8')
    else:
        encoded_image = None

    print(description)
    print(encoded_image)
    try:
        place_details = get_travel_ideas(description, encoded_image)
        return {
            "place_details": place_details,

        }
    except Exception as e:
        error_stack = traceback.format_exc()
        return make_response(jsonify({"error": str(e), "stack_trace": error_stack}), 500)

@app.route("/get_detail", methods=['POST'])
def get_detail():
    place = request.form.get('place')
    try:
        description, review_summary = get_description_and_reviews(place)
        return {
            "description": description,
            "review_summary": review_summary
        }
    except Exception as e:
        error_stack = traceback.format_exc()
        return make_response(jsonify({"error": str(e), "stack_trace": error_stack}), 500)


if __name__ == "__main__":
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. This
    # can be configured by adding an `entrypoint` to app.yaml.
    # Flask's development server will automatically serve static files in
    # the "static" directory. See:
    # http://flask.pocoo.org/docs/1.0/quickstart/#static-files. Once deployed,
    # App Engine itself will serve those files as configured in app.yaml.
    app.run(host="127.0.0.1", port=8080, debug=True)
