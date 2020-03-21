ESP32 setup - test server
=========================

Normally you'd test an Angular project against a [Node.js](https://nodejs.org/en/about/) server. But as we plan to use this project with a MicroPython server, I've gone with a Python [Flask](https://flask.palletsprojects.com/) based server.

Setup
-----

I created a new Python project with a standard venv:

    $ mkdir test-server
    $ cd test-server
    $ python3 -m venv env
    $ source env/bin/activate
    $ pip install --upgrade pip

I installed Flask:

    $ pip install Flask

Using the Flask [quickstart guide](https://flask.palletsprojects.com/en/1.1.x/quickstart/) I created `server.py`.

And ran it like so:

    $ export FLASK_APP=server.py
    $ flask run

Note: one of the packages that Flask depends on needs Unicode locale, so it didn't like that I had `LANG=C`. This was easy to fix with:

    $ export LC_ALL=en_US.utf-8

Then you can request its dummy set of access points like so:

    $ curl -v http://localhost:5000/api/access-points

To simulate connect to an access point you can post a BSSID and password like so:

    $ curl -v --data 'bssid=alpha&password=good' localhost:5000/api/access-point

A password containing the word "good" produces a successful `NO_CONTENT` response, one containing "invalid" produces a `BAD_REQUEST` response, one consisting of 3 digits and a description, e.g. "400 my custom error description" produces a response with that status code and description. Any other password value produces a `FORBIDDEN` response.

If you have [`jq`](https://stedolan.github.io/jq/) installed you can get more readable output like so:

    $ curl -v --data 'bssid=alpha&password=bad' localhost:5000/api/access-point | jq .

Notes
-----

If you were serious about building a REST API with Python you _might_ be better off using something like:

* [flask-restful](https://flask-restful.readthedocs.io/en/latest/)
* [flask-restx](https://flask-restx.readthedocs.io/en/latest/) - a fork of flask-restful that adds auto generated Swagger documentation.
* [eve](https://docs.python-eve.org/en/stable/)

Notes:

* All three use flask under the covers.
* flask-restx has relatively few star but this is a consequence of its rececent history - its a fork of flask-restplus (an earlier and no longer maintained fork of flask-restful).
* flask-restful and flask-restx are lightweight additions to flask whereas eve is more heavyweight and pulls in a dependency on [mongoDB](https://docs.mongodb.com/manual/introduction/).
