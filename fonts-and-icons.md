Self-hosting icon and font files
================================

In the end I went with a fairly simple approach to self-hosting the icon and font files pulled in via `src/index.html` - see [`NOTES.md`](NOTES.md) for details.

Google covers getting the raw assets here:

* http://google.github.io/material-design-icons/#getting-icons - includes instructions for getting individual SVGs and installing via npm.
* https://fonts.google.com/specimen/Roboto - here you can view the fonts but only download old style TTF files rather than web optimized WOFF2.

But actually you can use `npm` to install both:

    $ npm install typeface-roboto
    $ npm install material-design-icons

Note that, unlike `material-design-icons`, [`typeface-roboto`](https://github.com/KyleAMathews/typefaces/tree/master/packages/roboto) isn't from Google - but seems popular and basically automates the process described by Google's own https://github.com/google/fonts - i.e. using [google-webfonts-helper](https://github.com/majodev/google-webfonts-helper) to generate CSS and WOFF files.

Once installed you can find the CSS files in `node_modules/typeface-roboto/index.css` and `node_modules/material-design-icons/iconfont/material-icons.css` and from there you can find the referenced WOFF2 files.

Over time there have been various ways to pull these into your Angular project, but the current "right way" seems to be to use SCCS (unfortunately, I chose CSS) and to add the following to your `src/styles.scss`:

    @import '~material-design-icons/iconfont/material-icons.css';
    @import '~typeface-roboto/index.css';

See this [SO answer](https://stackoverflow.com/a/53575087/245602) more information.

In the end though I went with a simpler but more mechanical approach that's covered in `NOTES.md`.
