Notes
=====

I used [Angular CLI](https://cli.angular.io/) version 9.0.6:

    $ npm install -g npm
    $ npm --version
    6.14.2
    $ npm install -g @angular/cli
    $ ng version
    ...
    Angular CLI: 9.0.6
    Node: 13.11.0

Basic Angular project setup
---------------------------

You can create a new Angular project with `ng new`. `ng new` has a `--minimal` option, but it's a bit too minimal - in particular it excludes `tslint`.

So I compared two projects created as shown:

    $ ng new --routing=false --style=css --skip-install --minimal --directory alpha foo
    $ ng new --routing=false --style=css --skip-install --skip-tests --directory beta foo
    $ diff -qr alpha beta

And on the basis of this created a new project like so:

    $ ng new --routing=false --style=css --skip-install --skip-tests --directory esp32-setup-material esp32-setup

And set about minimizing it:

    $ cd esp32-setup-material
    $ git rm -r .editorconfig e2e karma.conf.js src/test.ts tsconfig.spec.json src/app/app.component.html
    $ git commit -m 'Removed test related resources, .editorconfig and the getting-started app.component.html content.'

Then I added back `app.component.html` (empty this time), removed the `test` and `e2e` blocks from `angular.json` and removed the Jasmine, Karma and Protractor packages from `package.json`:

    $ touch src/app/app.component.html
    $ git add src/app/app.component.html
    $ vi angular.json
    $ vi package.json 
    $ git commit -a 'Removed test and e2e blocks from angular.json, removed test packages from package.json and added back an empty src/app/app.component.html.'

If you now look at what's left, it's actually a fairly small set of files:

    $ find * -type f | sort
    README.md
    angular.json
    ...

The `README` is worth reading for a quick set of notes on basic usage.

Now we can install the packages that the project needs:

    $ npm install

There are quite a lot of warnings about optional dependencies but this is fine.

Once `install` is complete you end up with a `node_modules` subdirectory and a `package-lock.json` file. The `package-lock.json` should be added to the repo (see [npm-package-lock.json](https://docs.npmjs.com/configuring-npm/package-lock-json.html) for more details):

    $ git add package-lock.json 
    $ git commit -m 'Added package-lock.json.'

Now we can build and serve the project (and automatically open it in the current browser):

    $ ng serve --open

A very unexciting empty page opens, but if you keep it open it will automatically update to show changes, as you make them, to the project.

It's more interesting it you open your browser developer tools. Here you can look at what was served and in particular look at the console output for errors.

If all has gone well the console should just report:

    Angular is running in the development mode. Call enableProdMode() to enable the production mode.
    [WDS] Live Reloading enabled.

Adding Angular Material
-----------------------

As per the [getting started](https://material.angular.io/guide/getting-started) guide:

    $ ng add @angular/material

When asked, I selected Indigo/Pink as the theme, selected yes for Angular Material typography and yes for browser animations.

Then for a basic start, I added a Material toolbar as per the [toolbar](https://material.angular.io/components/toolbar) documentation.

Then I generated a new component:

    $ ng generate component access-points

And updated the generated skeleton files to display a clickable list of (dummy) access points (and log to the console when an item in the list is clicked).

Miscellaneous notes
-------------------

In the ["Add the AppRoutingModule"](https://angular.io/tutorial/toh-pt5#add-the-approutingmodule) section of Angular ToH tutorial, it covers adding the AppRoutingModule late in the development process.
  
But you can leave it to the CLI to add most of that boilerplate right at the start by specifying `--routing=true`:

    $ ng new --routing=true --style=css angular-tour-of-heroes

Note: if you don't specify `--routing` and `--style` it'll interactively ask how you want these configured.
