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

Production build
----------------

To build a set of files suitable for production deployment:

    $ ng build --prod

The result ends up in `dist/esp32-setup`. To quickly test them out without any backend:

    $ cd dist/esp32-setup
    $ python3 -m http.server

And open http://localhost:8000/ in your browser.

If you open the network tab in your browser's developer tools, you'll notice that it's not quite all local. There are two requests for CSS from fonts.googleapis.com and these reference `.woff2` files for Material icons and the Roboto font.

Moving to self-hosted icon and font files
-----------------------------------------

As noted the default setup is to load the Material icons and the Roboto font from fonts.googleapis.com.

They're pulled in via `@font-face` definitions in the two stylesheets pulled in by `src/index.html`:

* https://fonts.googleapis.com/icon?family=Material+Icons
* https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap

When you request these files Google looks at your user-agent header and serves back CSS that uses TTF, WOFF or WOFF2 depending on how modern your browser is.

According to caniuse.com [@font-face: WOFF2](https://caniuse.com/#feat=mdn-css_at-rules_font-face_woff_2) is supported by 92% browsers in current use, which is only a little less than the 95% for WOFF and the 96% for TTF.

So I replaces these stylesheets in `src/index.html` with static self-hosted versions that use WOFF2:

    USER_AGENT='User-Agent: AppleWebKit/537.36 Chrome/76.0.3809.100'
    $ curl -H "$USER_AGENT" 'https://fonts.googleapis.com/icon?family=Material+Icons' > src/assets/css/material-icons.css
    $ curl -H "$USER_AGENT" 'https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap' > src/assets/css/typeface-roboto.css

Then I removed the non-latin definitions from `src/assets/css/typeface-roboto.css` (as is also done in npm installable [typeface-roboto](https://github.com/KyleAMathews/typefaces/tree/master/packages/roboto)).

And finally I replaced the WOFF2 URLs in `material-icons.css` and `typeface-roboto.css` with self-hosted versions:

    $ curl https://fonts.gstatic.com/s/materialicons/v50/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2 > src/assets/fonts/MaterialIcons-Regular.woff2
    $ curl https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmSU5fBBc4.woff2 > src/assets/fonts/roboto-latin-300.woff2
    $ curl https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.woff2 > src/assets/fonts/roboto-latin-400.woff2
    $ curl https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9fBBc4.woff2 > src/assets/fonts/roboto-latin-500.woff2

Note that while the CSS files can reference lots of fonts and icon URLs, these are only fetched if something actually makes use of the relevant CSS rule.

WOFF2 files are _already_ compressed and even the entire Angular icon set comes in at just 60KiB.

For more on fonts and icons see [`fonts-and-icons.md`](fonts-and-icons.md).

Form creation
-------------

Adding validation requirements to an input field is easy:

    <input matInput required minlength="8" ...>

However it took me quite some time to work out that for the validation to work the field _must_ be named:

    <input matInput name="password" required minlength="8" ...>

Toggling the visibility of the entered password is easy. There are many complex solutions floating around on the web, but Ole Ersoy demonstrates a super simple approach in his ["Angular Material Password Field With Visibility Toggle"](https://link.medium.com/z4h8YHrpZ4) blog post. There's an even simpler approach if you use a checkbox (which is actually used in the Android 9 WiFi connection dialog) as described by Jeremy Elbourn in his comment on Material Design GitHub issue [#1940](https://github.com/angular/components/issues/1940#issuecomment-262106389).

Miscellaneous notes
-------------------

In the ["Add the AppRoutingModule"](https://angular.io/tutorial/toh-pt5#add-the-approutingmodule) section of Angular ToH tutorial, it covers adding the AppRoutingModule late in the development process.
  
But you can leave it to the CLI to add most of that boilerplate right at the start by specifying `--routing=true`:

    $ ng new --routing=true --style=css angular-tour-of-heroes

Note: if you don't specify `--routing` and `--style` it'll interactively ask how you want these configured.
