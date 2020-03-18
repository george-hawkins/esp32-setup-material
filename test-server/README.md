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

Then you can test it like so:

    $ curl -v http://localhost:5000/api/access-points
