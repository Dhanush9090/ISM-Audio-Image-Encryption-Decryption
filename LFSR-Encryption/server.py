from flask import Flask, request, jsonify
from PIL import Image
from lfsr import LFSR
import os

app = Flask(__name__)


def encrypt_image(image_name, original_directory, output_filename):
    lfsr = LFSR(15, "gal", [1 for _ in range(15)])
    ints = lfsr.encrypt_decrypt_ints()
    original_path = os.path.join(original_directory, image_name)
    im = Image.open(original_path)
    px = im.load()
    width, height = im.size
    value = 0  # Initialize the value for LFSR
    for i in range(width):
        for j in range(height):
            r, g, b, temp = px[i, j]
            r = (r) ^ ints[value]
            value = (value + 1) % len(ints)
            g = (g) ^ ints[value]
            value = (value + 1) % len(ints)
            b = (b) ^ ints[value]
            value = (value + 1) % len(ints)
            temp = (temp) ^ ints[value]
            value = (value + 1) % len(ints)
            px[i, j] = (r, g, b, temp)
    encrypted_path = os.path.join(original_directory, output_filename)
    im.save(encrypted_path)
    return encrypted_path


def decrypt_image(image_name, encrypted_directory, output_filename):
    lfsr = LFSR(15, "gal", [1 for _ in range(15)])
    ints = lfsr.encrypt_decrypt_ints()  # Reusing the encryption key
    encrypted_path = os.path.join(encrypted_directory, image_name)
    im = Image.open(encrypted_path)
    px = im.load()
    width, height = im.size
    value = 0  # Initialize the value for LFSR
    for i in range(width):
        for j in range(height):
            r, g, b, temp = px[i, j]
            r = (r) ^ ints[value]
            value = (value + 1) % len(ints)
            g = (g) ^ ints[value]
            value = (value + 1) % len(ints)
            b = (b) ^ ints[value]
            value = (value + 1) % len(ints)
            temp = (temp) ^ ints[value]
            value = (value + 1) % len(ints)
            px[i, j] = (r, g, b, temp)
    decrypted_path = os.path.join(encrypted_directory, output_filename)
    im.save(decrypted_path)
    return decrypted_path


@app.route("/encrypt-image", methods=["POST"])
def encrypt_endpoint():
    json_data = request.json
    print("Received request to encrypt image:", json_data)  # Print received data
    image_name = json_data["image_name"]
    original_directory = json_data["original_directory"]
    output_filename = json_data["output_filename"]
    encrypted_path = encrypt_image(image_name, original_directory, output_filename)
    return jsonify({"encrypted_image": encrypted_path})


@app.route("/decrypt-image", methods=["POST"])
def decrypt_endpoint():
    json_data = request.json
    print("Received request to decrypt image:", json_data)  # Print received data
    image_name = json_data["image_name"]
    encrypted_directory = json_data["original_directory"]
    output_filename = json_data["output_filename"]
    decrypted_path = decrypt_image(image_name, encrypted_directory, output_filename)
    return jsonify({"decrypted_image": decrypted_path})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
