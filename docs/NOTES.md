Notes
=====

This project was developed using [Angular](https://angular.io/guide/architecture) and the [Angular CLI](https://cli.angular.io/).

This file contains various notes I made while putting the project together.

Initial project setup
---------------------

I created the project with `ng new` like so:

    $ ng new --routing=false --style=css --skip-install --skip-tests --directory material-wifi-setup wifi-setup

Note: if you don't specify `--routing` and `--style` it'll interactively ask how you want these configured.

The generated `README` is worth reading for a quick set of notes on basic usage.

I then stripped out all the components I didn't want (as described below in the section of creating a minimal Angular project).

Once minimized, I installed all the packages that the project needs:

    $ npm install

There are quite a number of warnings about optional dependencies but this is fine.

Once `install` is complete you end up with a `node_modules` subdirectory and a `package-lock.json` file. The `package-lock.json` should be added to the repo (see [npm-package-lock.json](https://docs.npmjs.com/configuring-npm/package-lock-json.html) for more details):

    $ git add package-lock.json
    $ git commit -m 'Added package-lock.json.'

Now the project can be built, served and automatically opened in the current browser:

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

However during development it's more convenient to have a separate test-server running as the backend (as described in the main [`README`](../README.md)).

This is achieved by adding [`src/proxy.conf.json`](../src/proxy.conf.json) and adding a `proxyConfig` entry to [`angular.json`](../angular.json) as described in the ["Proxying to a backend server"](https://angular.io/guide/build#proxying-to-a-backend-server) section of the Angular development workflow guide.

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

**Update:** in the end, I removed `MaterialIcons-Regular.woff2` and instead just added only the icons I used to `icons.svg` (see section on this below). I would **not** do this in any situation other than for the extremely resource limited MicroPython setup.

Self-hosting icon and font files - the details
----------------------------------------------

As noted above, I went with a fairly simple approach to self-hosting the icon and font files pulled in via `src/index.html`.

Google covers getting the raw assets here:

* The ["Getting icons"](http://google.github.io/material-design-icons/#getting-icons) section of the Material icons guide - includes instructions for getting individual SVGs and installing them via `npm`.
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

In the end though I went with a simpler but more mechanical approach to all this, that's covered above.

Material icons
--------------

For whatever reason the Material icons [reference page](https://material.io/resources/icons/) does **not** include all available icons. There are some notable omissions, e.g. the icons associated with copy and paste (I commented on this in material-design-icons issue [#969](https://github.com/google/material-design-icons/issues/968#issuecomment-602195994)).

The material-design-icons repo includes a directory of [reference pages](https://github.com/google/material-design-icons/tree/master/sprites/svg-sprite) for all the sprites they provide. Oddly, I can't find these served in a directly viewable form (on GitHub you can just view the raw HTML) so you have to use something like [raw.githack.com](https://raw.githack.com/) to view them like so:

* [Action](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-action.html).
* [Alert](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-alert.html).
* [Av](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-av.html).
* [Communication](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-communication.html).
* [Content](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-content.html).
* [Device](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-device.html).
* [Editor](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-editor.html).
* [File](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-file.html).
* [Hardware](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-hardware.html).
* [Image](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-image.html).
* [Maps](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-maps.html).
* [Navigation](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-navigation.html).
* [Notification](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-notification.html).
* [Places](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-places.html).
* [Social](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-social.html).
* [Toggle](https://raw.githack.com/google/material-design-icons/master/sprites/svg-sprite/svg-sprite-toggle.html).

Some of these sprites are available in the standard Material icons font file despite not being listed on the reference page. E.g. the `ic_content_copy_24px` sprite (found on the Content page above) is there, you just have to knock off the `ic_` prefix and the `_24px` suffix and use it like so:

    <mat-icon>content_copy</mat-icon>

Others however are missing, e.g. on the Devices page, you can find various signal strength sprites - `signal_wifi_0_bar` to `signal_wifi_4_bar` - however only the 4 bar variant is available in the font file:

    <mat-icon>signal_wifi_4_bar</mat-icon>

According to the `MatIcon` [documentation](https://material.angular.io/components/icon/api#MatIcon) it's the text associated with a ligature that determines the name you use with the `mat-icon` tag. I haven't found a simple way to dump these names for a font file but you can see them in the [`codepoints`](https://github.com/google/material-design-icons/blob/master/iconfont/codepoints) file in the material-design-icons repo. Here you can easily see that `content_copy` and `signal_wifi_4_bar` are present but `signal_wifi_0_bar` is not.

For sprites that aren't available in the Material icons font, you can find (as noted [here](http://google.github.io/material-design-icons/#icon-images-for-the-web)) the appropriate SVG icons under `*/svg/production` in the material-design-icon [repo](https://github.com/google/material-design-icons/). E.g. `signal_wifi_0_bar` is under `device/svg/production` as `ic_signal_wifi_0_bar_24px.svg`. There are also 18px and 48px variants but 24px is the standard size used by `mat-icon`.

To use such icons, I copied them into my project like so:

    $ mkdir -p src/assets/svg/icons
    $ cp ../material-design-icons/device/svg/production/ic_signal_wifi_?_bar_24px.svg src/assets/svg/icons

And then I registered them with `MatIconRegistry` in a fashion similar to that described in this [tutorial](https://dev.to/elasticrash/using-custom-made-svg-icons-through-the-angular-material-library-2pif) by Stefanos Kouroupis.

**Update:** registering icons with `MatIconRegistry` only tells it where the icons are, they are only really loaded if they're actually used somewhere. Usually, this is a positive. But loading the individual SVG files one by one from a MicroPython device results in the icons slowly popping into existence.

So I combined them into an icon set - I couldn't find any good documentation on how to do this and there's surprising variation in the layout of the SVG icon sets out there (they also seem to have rather gone out of style, with icon fonts appearing to be more common these days). In the end, I just looked at various examples and went with the layout that involved the least modification to the existing SVG data.

Essentially I did:

    $ for svg in ic_signal_wifi_*.svg
    do
        id=${svg/.svg}
        sed -e 's/xmlns="[^"]*" width="[^"]*" height="[^"]*"/'id=\"$id\"/ -e 's/>/>\n/g' < $svg
    done > tmp
    $ echo "<svg><defs>$(< tmp)</defs></svg>" | xmllint --format - > tmp2
    $ rm tmp ic_signal_wifi_*
    $ mv tmp2 icons.svg 

And updated `src/app/icon.service.ts` to use `MatIconRegistry.addSvgIconSet` rather than `MatIconRegistry.addSvgIcon`.

Creating a minimal initial Angular project
------------------------------------------

You can create a new Angular project with `ng new`. `ng new` has a `--minimal` option, but it's a bit too minimal - in particular it excludes `tslint`.

So I compared two projects created as shown:

    $ ng new --routing=false --style=css --skip-install --minimal --directory alpha foo
    $ ng new --routing=false --style=css --skip-install --skip-tests --directory beta foo
    $ diff -qr alpha beta

And on the basis of this created a new project like so:

    $ ng new --routing=false --style=css --skip-install --skip-tests --directory material-wifi-setup wifi-setup

And set about minimizing it:

    $ cd material-wifi-setup
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

Form creation
-------------

Adding validation requirements to an input field is easy:

    <input matInput required minlength="8" ...>

However it took me quite some time to work out that for the validation to work the field _must_ be named:

    <input matInput name="password" required minlength="8" ...>

The `type` of `button` elements is `submit` by default, this caused me a lot of confusion as initially, I didn't set the `type` attribute for the CANCEL and CONNECT buttons in my dialog. When I found that pressing return caused the dialog to close even if a valid password hadn't been entered I tried setting the `type` of the CONNECT button to `submit` but this changed nothing. It turned out pressing return was triggering CANCEL and the way to disable this was to explicitly set its type to `button`.

**Update:** initially I used the HTML attributes `required` and `minlength` to specify validity for the password field. However clicking on the visibility icon in the field caused its validity to be updated immediately (even though from a user point of view you haven't left the field) and it was visually marked in red as invalid (if you hadn't already entered the minimum required number of characters). So in the end I removed the `required` and `minlength` attributes. The field is now never marked as invalid and the connect button (that used to become enabled once the overall form stopped being invalid) is now disabled via a simple check on the password property of the underlying component.

Note: Angular has two different approaches to handling forms - template-driven and reactive. Template-driven forms use the standard HTML attributes, like `minlength` etc., to establish validity. While initially simple, this doesn't work out so well once things get a little bit complicated - for this you need reactive forms where the validity is configured in the underlying component class. See the Angular [forms guide](https://angular.io/guide/forms-overview) for more.

Toggling password visibility
----------------------------

Toggling the visibility of the entered password is easy. There are many complex solutions floating around on the web, but Ole Ersoy demonstrates a super simple approach in his ["Angular Material Password Field With Visibility Toggle"](https://link.medium.com/z4h8YHrpZ4) blog post. There's an even simpler approach if you use a checkbox (which is what is actually used in the Android 9 WiFi connection dialog) as described by Jeremy Elbourn in his comment on Material Design GitHub issue [#1940](https://github.com/angular/components/issues/1940#issuecomment-262106389).

ng build and es5
----------------

Try the following:

    $ ng new --routing=false --style=css --minimal foo
    $ cd foo
    $ ng build --prod
    Generating ES5 bundles for differential loading...
    ES5 bundle generation complete.

    chunk {2} polyfills-es2015.bbb42ff2e1c488ff52d5.js (polyfills) 36.1 kB [initial] [rendered]
    chunk {3} polyfills-es5.0e4e1968447fab48e788.js (polyfills-es5) 129 kB [initial] [rendered]
    ...
    chunk {1} main-es2015.9e7e7292fefbda1ff69e.js (main) 104 kB [initial] [rendered]
    chunk {1} main-es5.9e7e7292fefbda1ff69e.js (main) 125 kB [initial] [rendered]

As you can see it builds `.js` files for es5 (around since 2009) and es2015 (around since 2015, obviously), i.e. the 5th and 6th versions of JavaScript (technically ECMAScript, hence the "es"). The es5 files more than double the size of the build.

The [`browserslist`](browserslist) file here determines the browsers for which the generated JavaScript has to be compatible. The file uses a query language (described [here](https://github.com/browserslist/browserslist#queries)) to specify the relevant browsers. You can see which browsers are selected by the current `browserslist` file like so:

    $ npx browserslist
    and_chr 80
    and_ff 68
    android 80
    ...

There's no simple way to determine which ones are pulling in the need for es5. So using a minimal project, like the one just created above, I determined it by brute force like so:

    $ rm -rf dist/foo
    $ cp browserslist browserslist.bak
    $ npx browserslist > browserslist.expanded
    $ j=1; while read line
    do
        echo "$line" > browserslist
        echo "$j $line"
        ng build --prod
        mv dist/foo $dist/j
        let j++
    done < browserslist.expanded
    $ du -h dist/* | sort -n
    172K    dist/1
    172K    dist/10
    ...
    440K    dist/4
    440K    dist/6

Then I related the number `4`, `6` etc., associated with large directories, with the indexes printed out by the `while` loop.

The resulting list was:

* Internet Explorer
* Opera Mini and Opera Mobile
* UC
* QQ
* KaiOS
* Baidu

Updating `browserslist` to exclude these browsers reduced the build size substantially but also excludes about 10% of browser users.
