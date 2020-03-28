Notes
=====

This project was developed using [Angular](https://angular.io/guide/architecture) and the [Angular CLI](https://cli.angular.io/).

This file contains various notes I made while putting the project together.

Initial project setup
---------------------

I created the project with `ng new` like so:

    $ ng new --routing=false --style=css --skip-install --skip-tests --directory wifi-setup-material wifi-setup

Note: if you don't specify `--routing` and `--style` it'll interactively ask how you want these configured.

The generated `README` is worth reading for a quick set of notes on basic usage.

I then stripped out all the components I didn't want (as described below in the section of creating a minimal Angular project).

Once minimized, I installed all the packages that the project needs:

    $ npm install

There are quite a number of warnings about optional dependencies but this is fine.

Once `install` is complete you end up with a `node_modules` subdirectory and a `package-lock.json` file. The `package-lock.json` should be added to the repo (see [npm-package-lock.json](https://docs.npmjs.com/configuring-npm/package-lock-json.html) for more details):

    $ git add package-lock.json
    $ git commit -m 'Added package-lock.json.'

Now the project can be built, served and automatically opened it in the current browser:

    $ ng serve --open

By default a canned next-steps page opens, but if you've already minimized things, as I did, then a very unexciting empty page opens. However, if you keep it open it will automatically update to show changes, as you make them, to the project.

The automatic updating only goes so far, sometimes you'll see errors that aren't really errors - you just have to kill and restart `ng serve`.

More interesting than the empty page is what you can see if you open your browser's [developer tools](https://developers.google.com/web/tools/chrome-devtools). Here you can look at what was served and in particular look at the console output for errors.

If all has gone well the console should just report:

    Angular is running in the development mode. Call enableProdMode() to enable the production mode.
    [WDS] Live Reloading enabled.

To serve a production, i.e. non-development, version:

    $ ng serve --prod

Updating the project
--------------------

New releases of Angular and the other packages in this project come out fairly regularly. You can update everything to the latest releases like so:

    $ ng update --all

And then check if there's anything left that it didn't update:

    $ npm outdated

Test backend server
-------------------

The intention is that the frontend created here is served out by the same server that provides the backend with which it communicates (using [REST](https://en.wikipedia.org/wiki/Representational_state_transfer)).

However during development it's more convenient to have a separate test-server running as the backend (as described in the main [`README`](README.md)).

This is achieved by adding [`src/proxy.conf.json`](src/proxy.conf.json) and adding a `proxyConfig` entry to [`angular.json`](angular.json) as described in the ["Proxying to a backend server"](https://angular.io/guide/build#proxying-to-a-backend-server) section of the Angular development workflow guide.

With this done, `ng serve` will automatically proxy frontend requests for URLs like `/api/access-points` through to the test server (this works even when using `--prod` with `ng serve`).

Adding Angular Material
-----------------------

The visual components of this project are provided by [Angular Material](https://material.angular.io/). The `@angular/material` package was added as per the [getting started](https://material.angular.io/guide/getting-started) guide:

    $ ng add @angular/material

When asked, I selected Indigo/Pink as the theme, selected yes for Angular Material typography and yes for browser animations.

Then for a basic start, I added a Material toolbar as per the [toolbar](https://material.angular.io/components/toolbar) documentation.

Then I generated a new component:

    $ ng generate component --inline-style access-points

And updated the generated skeleton files to display a clickable list of (dummy) access points (and log to the console when an item in the list is clicked).

Production build
----------------

To build a set of files suitable for production deployment:

    $ ng build --prod

The result ends up in `dist/wifi-setup`. To quickly test them out without any backend:

    $ cd dist/wifi-setup
    $ python3 -m http.server

And open <http://localhost:8000/> in your browser.

If you open the network tab in your browser's developer tools, you'll notice that it's not quite all local. There are two requests for CSS from fonts.googleapis.com (and these reference `.woff2` files for Material icons and the Roboto font).

Moving to self-hosted icon and font files
-----------------------------------------

As just noted, the default setup is to load the Material icons and the Roboto font from fonts.googleapis.com.

They're pulled in via `@font-face` definitions in the two stylesheets specified in [`src/index.html`](src/index.html):

* <https://fonts.googleapis.com/icon?family=Material+Icons>
* <https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap>

When you request these files Google looks at your user-agent header and serves back CSS that uses TTF, WOFF or WOFF2 depending on how modern your browser is.

According to caniuse.com [@font-face: WOFF2](https://caniuse.com/#feat=mdn-css_at-rules_font-face_woff_2) is supported by 92% browsers in current use, which is only a little less than the 95% for WOFF and the 96% for TTF.

So I replaced these stylesheets in `src/index.html` with static self-hosted versions that use WOFF2:

    USER_AGENT='User-Agent: AppleWebKit/537.36 Chrome/76.0.3809.100'
    $ curl -H "$USER_AGENT" 'https://fonts.googleapis.com/icon?family=Material+Icons' > src/assets/css/material-icons.css
    $ curl -H "$USER_AGENT" 'https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap' > src/assets/css/typeface-roboto.css

The `USER_AGENT` string above was derived from my actual browser's user-agent and was the minimum necessary to get Google to serve the WOFF2 versions of the requested files.

Then I removed the non-latin definitions from `src/assets/css/typeface-roboto.css` (as is also done in npm installable [typeface-roboto](https://github.com/KyleAMathews/typefaces/tree/master/packages/roboto)).

And finally I replaced the WOFF2 URLs in `material-icons.css` and `typeface-roboto.css` with self-hosted versions:

    $ curl https://fonts.gstatic.com/s/materialicons/v50/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2 > src/assets/fonts/MaterialIcons-Regular.woff2
    $ curl https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmSU5fBBc4.woff2 > src/assets/fonts/roboto-latin-300.woff2
    $ curl https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxK.woff2 > src/assets/fonts/roboto-latin-400.woff2
    $ curl https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmEU9fBBc4.woff2 > src/assets/fonts/roboto-latin-500.woff2

Note that while the CSS files can reference lots of fonts and icon URLs, these are only ever fetched if something actually makes use of the relevant CSS rule.

WOFF2 files are _already_ compressed and even the entire Angular icon set comes in at just 60KiB.

Form creation
-------------

Adding validation requirements to an input field is easy:

    <input matInput required minlength="8" ...>

However it took me quite some time to work out that for the validation to work the field _must_ be named:

    <input matInput name="password" required minlength="8" ...>

The `type` of `button` elements is `submit` by default, this caused me a lot of confusion as initially, I didn't set the `type` attribute for the CANCEL and CONNECT buttons in my dialog. When I found that pressing return caused the dialog to close even if a valid password hadn't been entered I tried setting the `type` of the CONNECT button to `submit` but this changed nothing. It turned out pressing return was triggering CANCEL and the way to disable this was to explicitly set its type to `button`.

**Update:** initially I used the HTML attributes `required` and `minlength` to specify validity for the password field. However clicking on the visibility icon in the field caused its validity to be updated immediately (even though from a user point of view you haven't left the field) and it was visually marked in red as invalid (if you hadn't already entered the minimum required number of characters). So in the end I removed the `required` and `minlength` attributes. The field is now never marked as invalid and the connect button (that used to become enabled once the overall form stopped being invalid) is now disabled via a simple check on the password property of the underlying component.

Note: Angular has two different approaches to handling forms - template-driven and reactive. Template-driven forms use the standard HTML attributes, like `minlength` etc., to establish validity. While initially simple this doesn't work out so well once things get a little bit complicated -for this you need reactive forms where the validity is configured in the underlying component class. See the Angular [forms guide](https://angular.io/guide/forms-overview) for more.

Toggling password visibility
----------------------------

Toggling the visibility of the entered password is easy. There are many complex solutions floating around on the web, but Ole Ersoy demonstrates a super simple approach in his ["Angular Material Password Field With Visibility Toggle"](https://link.medium.com/z4h8YHrpZ4) blog post. There's an even simpler approach if you use a checkbox (which is what is actually used in the Android 9 WiFi connection dialog) as described by Jeremy Elbourn in his comment on Material Design GitHub issue [#1940](https://github.com/angular/components/issues/1940#issuecomment-262106389).

Signal strength and secured networks
------------------------------------

In my list of SSIDs I include a WiFi icon and a lock icon for each. Currently these are just for show. Ideally we could retrieve the RSSI value and the authentication required for each SSID, but as of MicroPython 1.12 this information is not availble for the ESP32 port (though the documentation suggests it may be available for other ports).

Creating a minimal initial Angular project
------------------------------------------

You can create a new Angular project with `ng new`. `ng new` has a `--minimal` option, but it's a bit too minimal - in particular it excludes `tslint`.

So I compared two projects created as shown:

    $ ng new --routing=false --style=css --skip-install --minimal --directory alpha foo
    $ ng new --routing=false --style=css --skip-install --skip-tests --directory beta foo
    $ diff -qr alpha beta

And on the basis of this created a new project like so:

    $ ng new --routing=false --style=css --skip-install --skip-tests --directory wifi-setup-material wifi-setup

And set about minimizing it:

    $ cd wifi-setup-material
    $ git rm -r .editorconfig e2e karma.conf.js src/test.ts tsconfig.spec.json src/app/app.component.html
    $ git commit -m 'Removed test related resources, .editorconfig and the getting-started app.component.html content.'

Then I added back `app.component.html` (empty this time), removed the `test` and `e2e` blocks and the references to `tsconfig.spec.json` and `e2e/tsconfig.json` from `angular.json` and removed the Jasmine, Karma and Protractor packages from `package.json`:

    $ touch src/app/app.component.html
    $ git add src/app/app.component.html
    $ vi angular.json
    $ vi package.json
    $ git commit -a -m 'Removed test and e2e blocks from angular.json, removed test packages from package.json and added back an empty src/app/app.component.html.'

If you now look at what's left, it's actually a fairly small set of files:

    $ find * -type f | sort
    README.md
    angular.json
    ...

Self-hosting icon and font files - the details
----------------------------------------------

As noted above, I went with a fairly simple approach to self-hosting the icon and font files pulled in via `src/index.html`.

Google covers getting the raw assets here:

* The ["Getting icons"](http://google.github.io/material-design-icons/#getting-icons) section of the Material icons guide - includes instructions for getting individual SVGs and installing via `npm`.
* The Google Fonts [Roboto page](https://fonts.google.com/specimen/Roboto) - here you can view the font but only download old style TTF files rather than web optimized WOFF2.

The easiest way to get both icons and fonts is to install them using `npm`:

    $ npm install typeface-roboto
    $ npm install material-design-icons

Note that, unlike `material-design-icons`, [`typeface-roboto`](https://github.com/KyleAMathews/typefaces/tree/master/packages/roboto) isn't from Google - but it seems popular and basically automates the process described on Google's own [fonts repo](https://github.com/google/fonts) - i.e. using [google-webfonts-helper](https://github.com/majodev/google-webfonts-helper) to generate CSS and WOFF2 files.

Once installed you can find the CSS files in `node_modules/typeface-roboto/index.css` and `node_modules/material-design-icons/iconfont/material-icons.css` and from there you can find the referenced WOFF2 files.

Over time there have been various ways to pull these into your Angular project, but the current "right way" seems to be to add the following at the start of your to your `src/styles.css`:

    @import 'material-design-icons/iconfont/material-icons.css';
    @import 'typeface-roboto';

Note: the Angular build process uses [postcss-import](https://github.com/postcss/postcss-import) to process these import statements and inline the referenced CSS. If you're wondering at the long explicit path for `material-design-icons` vs the much shorter import for `typeface-roboto`, it's because postcss-import can find the CSS file automatically if the package has a particular expected structure - `typeface-roboto` has this structure and `material-design-icons` does not.

In the end though I went with a simpler but more mechanical approach to all this, that's covered up above.
