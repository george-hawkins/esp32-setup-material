WiFi setup - test server
========================

Normally you'd test an Angular project against either the [in-memory web API module](https://angular.io/tutorial/toh-pt6#simulate-a-data-server) or against a [Node.js](https://nodejs.org/en/about/) server. But as this project is intended to be used with a [MicroPython](https://micropython.org/) server, I've gone with a Python [Flask](https://flask.palletsprojects.com/) based server for development purposes.

Setup
-----

The main [`README`](../README.md) describes installing a standard Python venv, then installing [Flask](https://flask.palletsprojects.com/) and [APScheduler](https://apscheduler.readthedocs.io/en/stable/userguide.html) and running the [`server.py`](server.py) file in Flask.

The `server.py` file was created using the Flask [quickstart guide](https://flask.palletsprojects.com/en/1.1.x/quickstart/) as the main reference.

Once running, you can request the server's dummy set of access points like so:

    $ curl -v http://localhost:5000/api/access-points

To simulate connecting to an access point you can post a BSSID and password like so:

    $ curl -v --data 'bssid=alpha&password=good' localhost:5000/api/access-point

A password containing the word "good" produces an `OK` response, one containing "invalid" produces a `BAD_REQUEST` response, one consisting of 3 digits and a description, e.g. "400 my custom error description" produces a response with that status code and description. Any other password value produces a `FORBIDDEN` response.

Note: the BSSID should be a valid 12 character hexidecimal string but the test server doesn't check this, hence it accepts values like `alpha` above.

If you have [`jq`](https://stedolan.github.io/jq/) installed you can get more readable output like so:

    $ curl -v --data 'bssid=alpha&password=bad' localhost:5000/api/access-point | jq .

You can test the keep-alive functionality like so:

    $ while true
    do
        curl --data 'timeout=2000' localhost:5000/api/alive
        echo -n .
        sleep 1
    done

While this runs the server will just report the `POST` requests happening every second but when you kill the loop, the server will report:

    Keep-alive timeout expired.

A non-test version of the server would exit at this point but this test-server just keeps running.

Returning JSON
--------------

Flask is perhaps overly flexible in the number of options it gives you to return something as JSON.

It automatically converts dicts to JSON:

    @app.route(...)
    def foo():
    return { 'alpha': 'beta' }

For any other kind of structure you have to explicitly convert it to a JSON response object:

    return jsonify(my_list)

Both of the above will set the HTTP status code to `200 OK`. For a different status code you can do:

    r = jsonify(my_list)
    r.status_code = HTTPStatus.FORBIDDEN
    return r

But Flask also provides a shortcut, where it'll set `status_code` for you, if you return a tuple:

    return jsonify(my_list), HTTPStatus.FORBIDDEN

Or for a dict, just:

    return { 'alpha': 'beta' }, HTTPStatus.FORBIDDEN

In a similar fashion you can also use a 3-tuple to additionally set headers:

    return { 'alpha': 'beta'}, HTTPStatus.FORBIDDEN, { 'X-gamma': 'epsilon' }

Or a 2-tuple if you want `200 OK` as the status:

    return { 'alpha': 'beta'}, { 'X-gamma': 'epsilon' }

Note: if you need to repeat headers, you'll need to use a [multidict](https://multidict.readthedocs.io/en/stable/).

Under the covers all the real work is being done by [`flask.Flask.make_response`](https://flask.palletsprojects.com/en/1.1.x/api/#flask.Flask.make_response) and you can return the result of this function directly if you want to avoid any further Flask post-processing:

    return make_response(({ 'alpha': 'beta'}, HTTPStatus.FORBIDDEN))

As above, you still use tuples with this function (rather than passing in separate arguments for content/response, status and headers).

Note that all of the above approaches correctly set the content-type for JSON.

REST APIs in Python
-------------------

If you were serious about building a REST API with Python you _might_ be better off using something like:

* [flask-restful](https://flask-restful.readthedocs.io/en/latest/)
* [flask-restx](https://flask-restx.readthedocs.io/en/latest/) - a fork of flask-restful that adds auto generated [Swagger](https://en.wikipedia.org/wiki/Swagger_(software)) documentation.
* [eve](https://docs.python-eve.org/en/stable/)

Notes:

* All three use flask under the covers.
* flask-restx has relatively few GitHub stars but this is a consequence of its rececent history - its a fork of flask-restplus (an earlier and no longer maintained fork of flask-restful).
* flask-restful and flask-restx are lightweight additions to flask whereas eve is more heavyweight and pulls in a dependency on [mongoDB](https://docs.mongodb.com/manual/introduction/).
