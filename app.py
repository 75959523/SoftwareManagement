import os

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import database_service

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'data'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
db = database_service.DatabaseService(config_path='config/config.yml')


@app.route('/api/login', methods=['POST'])
def login():
    data = request.form  # Access the data sent in the request body (form data)

    # Get the username and password from the request data
    username = data.get('username')
    password = data.get('password')

    # Perform validation logic (check username and password)
    if db.validate_user(username, password):
        return jsonify({"message": "Login successful!"}), 200
    else:
        return jsonify({"message": "Invalid username or password"}), 401


@app.route('/api/upload', methods=['POST'])
def upload_endpoint():
    data = request.form
    software_name = data.get('software_name')
    category = data.get('category')
    username = data.get('username')

    software_file = request.files['software_file']
    software_image = request.files['image']

    software_file.save(os.path.join(app.config['UPLOAD_FOLDER'], software_file.filename))
    software_image.save(os.path.join(app.config['UPLOAD_FOLDER'], software_image.filename))

    db.save_to_database(software_name,
                        category,
                        username,
                        os.path.join(app.config['UPLOAD_FOLDER'], software_file.filename),
                        os.path.join(app.config['UPLOAD_FOLDER'], software_image.filename))

    return jsonify({"message": "上传成功！", "success": True}), 200


@app.route('/api/software_list', methods=['POST'])
def get_software_list():
    # Call the get_list method to fetch data from the database
    software_list = db.get_list()
    # Return the list of software as a JSON response
    return jsonify(software_list)


@app.route('/api/delete_record', methods=['POST'])
def delete_record():
    data = request.form
    s_id = data.get("id")
    db.delete_record(s_id)
    return jsonify({"message": "删除成功！", "success": True}), 200


@app.route('/api/download', methods=['GET'])
def download():
    s_id = request.args.get("id")
    result = db.download_file(s_id)
    db.update_record(s_id)
    if result:
        file_path = result[0]
        return send_file(file_path, as_attachment=True)
    else:
        return 'Record not found.'


@app.route('/api/downloadImg', methods=['GET'])
def download_img():
    url = request.args.get("url")
    return send_file(url, as_attachment=True)


@app.route('/api/get_user_type', methods=['POST'])
def get_user_type():
    data = request.form
    username = data.get("username")
    user_type = db.get_user_type(username)
    return jsonify(user_type)


@app.route('/api/get_category', methods=['POST'])
def get_category():
    result = db.get_category()
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8088, debug=True)