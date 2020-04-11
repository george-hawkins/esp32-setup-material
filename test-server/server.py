from datetime import datetime, timedelta
from binascii import unhexlify
from http.server import BaseHTTPRequestHandler
from http import HTTPStatus
from random import randrange, randint, sample
from re import match
from time import sleep

from flask import Flask
from flask import json
from flask import jsonify
from flask import abort
from flask import request

from werkzeug.exceptions import HTTPException

from apscheduler.schedulers.background import BackgroundScheduler

scheduler = BackgroundScheduler()
scheduler.start()

# The underlying handler still defaults to HTTP/1.0.
BaseHTTPRequestHandler.protocol_version = "HTTP/1.1"

app = Flask(__name__)

APPLICATION_JSON = app.config["JSONIFY_MIMETYPE"]


@app.route("/api/access-points", methods=["GET"])
def access_points():
    sleep(2)  # Simulate delay in doing real scan.
    upper = len(_AP_LIST)
    lower = upper // 2
    size = randint(lower, upper)
    # Return a random sample of elements from _AP_LIST.
    list = sample(_AP_LIST, size)
    list = [(p[0].decode("utf-8"), p[1], p[2]) for p in list]
    return jsonify(list)


_AP_LIST = [
    (b"George Hawkins AC", -58, 3),
    (b"UPC Wi-Free", -58, 5),
    (b"Salt_2GHz_450122", -75, 3),
    (b"Salt_2GHz_8A9F85", -84, 3),
    (b"SiCo's", -86, 0),
    (b"SiCo's Ospiti", -86, 3),
    (b"jonas-guest", -91, 3),
    (b"teh-04236", -92, 4),
    (b"JB_40", -92, 0),
    (b"jonas-guest", -92, 3),
    (b"gurke", -93, 3),
    (b"ZyXEL_DAF8", -95, 0),
]

# Access points that are the names of the given languages in their specific script.
# Use to test round-tripping of UTF-8 SSIDs.
_AP_LIST += [
    (unhexlify(b"e6b189e8afad"), -100, 3),  # Chinese
    (unhexlify(b"d8a7d98ed984d992d8b9d98ed8b1d98ed8a8d990d98ad98ed991d8a9d98f"), -100, 3),  # Arabic
    (unhexlify(b"d180d183d181d181d0bad0b8d0b920d18fd0b7d18bd0ba"), -100, 3),  # Russian
    (unhexlify(b"ed959ceab5adec96b42f"), -100, 0),  # Korean
    (unhexlify(b"e0b8a0e0b8b2e0b8a9e0b8b2e0b984e0b897e0b8a2"), -100, 3),  # Thai
    (unhexlify(b"ce95cebbcebbceb7cebdceb9cebaceac"), -100, 3),  # Greek
    (unhexlify(b"d7a2d6b4d791d6b0d7a8d6b4d799d7aae2808e"), -100, 0),  # Hebrew
]


# With the non-open dummy APs you can signal with the password what response you want.
# For the open APs this isn't possible, so two of them just always response FORBIDDEN.
_FORBIDDEN_OPEN_APS = [
    b"JB_40",
    unhexlify(b"ed959ceab5adec96b42f")  # Korean
]


def _success():
    address = "192.168.0." + str(randrange(256))
    print("Returning dummy address {}".format(address))
    return {"message": address}


@app.route("/api/access-point", methods=["POST"])
def access_point():
    ssid = request.form["ssid"]
    print("Received request to connect to {} ".format(ssid), end="")
    password = request.form.get("password")
    if password:
        print("with password \"{}\"".format(password))
    else:
        print("without password");
    ssid = ssid.encode("utf-8")
    # Make sure the SSID didn't get mangled going from here to client and back.
    found = next((True for point in _AP_LIST if point[0] == ssid), False)
    if not found:
        abort(HTTPStatus.NOT_FOUND)

    if not password:
        from binascii import hexlify
        print(hexlify(ssid))
        print(_FORBIDDEN_OPEN_APS[1])
        forbidden = next((True for point in _FORBIDDEN_OPEN_APS if point == ssid), False)
        if forbidden:
            abort(HTTPStatus.FORBIDDEN)
        return _success()

    # Use the password to specify the response you want:
    # * If it contains "good" OK is returned.
    # * If it contains "invalid" BAD_REQUEST is returned.
    # * If it consists of 3 digits, a space and some text then they're returned as the status code and description.
    # * Otherwise FORBIDDEN is returned.
    if "good" in password:
        return _success()
    elif "invalid" in password:
        abort(HTTPStatus.BAD_REQUEST)
    else:
        m = match("([0-9]{3}) (.*)", password)
        if m:
            status = int(m.group(1))
            description = m.group(2)
            abort(status, description)
        else:
            abort(HTTPStatus.FORBIDDEN)


# If a client specifies a keep-alive period of Xs then they must ping again within Xs plus a fixed "tolerance".
TOLERANCE = 1

timeout_job = None


def timed_out():
    global timeout_job
    timeout_job = None
    # At this point a non-test server would shutdown.
    print("Keep-alive timeout expired.")


@app.route("/api/alive", methods=["POST"])
def alive():
    timeout = int(request.form["timeout"]) + TOLERANCE
    fire_at = datetime.now() + timedelta(seconds=timeout)
    global timeout_job
    if timeout_job:
        timeout_job.reschedule('date', run_date=fire_at)
    else:
        timeout_job = scheduler.add_job(timed_out, 'date', run_date=fire_at)
    return "", HTTPStatus.NO_CONTENT


@app.errorhandler(HTTPException)
def handle_exception(e):
    response = e.get_response()
    # Return errors as JSON rather than the Flask default of HTML.
    response.content_type = APPLICATION_JSON
    response.data = json.dumps({
        "code": e.code,
        "name": e.name,
        "description": e.description,
    })
    return response
