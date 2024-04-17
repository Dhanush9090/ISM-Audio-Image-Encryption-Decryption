from flask import Flask, request, jsonify
import scipy.io.wavfile
import numpy as np
import os
from tqdm import tqdm

app_audio = Flask(__name__)


def encrypt_audio(audio_name, original_directory, output_filename):
    audio_path = os.path.join(original_directory, audio_name)
    fs, data = scipy.io.wavfile.read(audio_path)
    dataarray = data
    a, b = dataarray.shape
    tup = (a, b)
    data = data.astype(np.int16)
    for i in range(0, tup[0]):
        for j in range(0, tup[1]):
            x = data[i][j]
            x = pow(x, 3) % 25777
            data[i][j] = x
    encrypted_filename = os.path.join(original_directory, output_filename)
    scipy.io.wavfile.write(encrypted_filename, fs, data)
    return encrypted_filename


def decrypt_audio(audio_name, original_directory, output_filename):
    encrypted_audio_path = os.path.join(original_directory, audio_name)
    fs, data = scipy.io.wavfile.read(encrypted_audio_path)
    data = data.astype(np.int16)
    data.setflags(write=1)
    data = data.tolist()

    for i1 in tqdm(range(len(data))):
        for j1 in range(len(data[i1])):
            x1 = data[i1][j1]
            x1 = pow(x1, 16971) % 25777
            data[i1][j1] = x1
    data = np.array(data)
    data = data.astype(np.uint8)
    decrypted_filename = os.path.join(original_directory, output_filename)
    scipy.io.wavfile.write(decrypted_filename, fs, data)
    return decrypted_filename


@app_audio.route("/encrypt-audio", methods=["POST"])
def encrypt_audio_endpoint():
    audio_name = request.json["audio_name"]
    original_directory = request.json["original_directory"]
    output_filename = request.json["output_filename"]
    encrypted_file = encrypt_audio(audio_name, original_directory, output_filename)
    print(f"Received request to encrypt audio: {audio_name}")
    return jsonify({"encrypted_audio": encrypted_file})


@app_audio.route("/decrypt-audio", methods=["POST"])
def decrypt_audio_endpoint():
    audio_name = request.json["audio_name"]
    original_directory = request.json["original_directory"]
    output_filename = request.json["output_filename"]
    decrypted_file = decrypt_audio(audio_name, original_directory, output_filename)
    print(f"Received request to decrypt audio: {audio_name}")
    return jsonify({"decrypted_audio": decrypted_file})


if __name__ == "__main__":
    app_audio.run(debug=True, port=6000)
