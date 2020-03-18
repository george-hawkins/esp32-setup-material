from http.server import BaseHTTPRequestHandler
from flask import Flask
from flask import jsonify

# The underlying handler still defaults to HTTP/1.0.
BaseHTTPRequestHandler.protocol_version = "HTTP/1.1"

app = Flask(__name__)

@app.route('/api/access-points')
def access_points():
    return jsonify(_AP_LIST)

_AP_LIST = [["George Hawkins AC", "788a20498c26"], ["UPC Wi-Free", "3a431d3e4ec7"], ["Salt_2GHz_8A9F85", "44fe3b8a9f87"], ["SiCo's", "d8fb5eac6d50"], ["SiCo's Ospiti", "d8fb5eac6d51"], ["Sonja's iPhone", "f249bec2ec94"], ["JB_40", "488d36d5c83a"], ["jonas-guest", "488d36d5c83b"], ["UPC73A7C75", "ac2205767bb4"], ["UPC Wi-Free", "ae2215767bb4"], ["UPC Wi-Free", "925c14cbe5d9"], ["Salt_2GHz_FC5BC1", "44fe3bfc5bc3"], ["UPC7E68DDA", "905c44cbe5d9"], ["Mattinet2", "e0469a684727"], ["jonas-guest", "a0648f3663b1"], ["gurke", "6466b31646e5"], ["uVoPiC", "5467512dbbf6"]]
