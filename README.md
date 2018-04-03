# GA Autotrack IDs

- [Overview](#overview)
- [Plugins](#plugins)
- [Installation and usage](#installation-and-usage)
  - [Loading autotrack via npm](#loading-autotrack-via-npm)
  - [Passing configuration options](#passing-configuration-options)
- [Advanced configuration](#advanced-configuration)
  - [Custom builds](#custom-builds)
  - [Using autotrack with multiple trackers](#using-autotrack-with-multiple-trackers)
- [Browser Support](#browser-support)
- [Translations](#translations)

## Overview

The default [JavaScript tracking snippet](https://developers.google.com/analytics/devguides/collection/analyticsjs/) for Google Analytics allows sites to track various user interactions. Every time an user interacts with your site and it results in data being sent to Analytics (i.e. pageview), a payload is composed by analytics.js with standard & supplementatal data fields about the user intereraction. This is known as a Hit, and several Hit Types exist. As your organization's analytics practices evolve, you may need to analyze all hit data in more nuanced and robust ways, specially outside of Google Analytics. Thus, GA Autotrack IDs was created to conveniently enhance the standard hit data collected by `analytics.js`. It provides default tracking to add Hit, Session & GA Client IDs, as well as a timestamp to every Hit.

## Plugins

The `ga-autotrack-ids.js` file in this repository is small (1.6K gzipped) and comes with all plugins included. You can use it as is, or you can create a [custom build](#custom-builds) that only includes the plugins you want to make it even smaller.

The following table briefly explains what each plugin does; you can click on the plugin name to see the full documentation and usage instructions:

| Plugin             | Description                                                       |
| ------------------ | ----------------------------------------------------------------------------------- |
| [`hitIdTracker`](/docs/plugins/hit-id-tracker.md) | Automatically generate a tiny, secure URL-safe UUID for every hit. |
| [`clientIdTracker`](/docs/plugins/client-id-tracker.md) | Store the GA  Anonimized client id in a Custom Dimension. |
| [`sessionIdTracker`](/docs/plugins/session-id-tracker.md) | Automatically generate a tiny, secure URL-safe UUID for every session and/or pass your own session id to be stored. |
| [`hitTimestrampTracker`](/docs/plugins/hit-timestamp-tracker.md) | Capture and store the current timestamp for every hit |



**Disclaimer:** GA Autotrack IDs is not in anyway associated with Google or Google Analytics, and is primarily intended for a developer audience. It is not an official Google Analytics product and does not qualify for Google Analytics 360 support. Developers who choose to use this library are responsible for ensuring that their implementation meets the requirements of the [Google Analytics Terms of Service](https://www.google.com/analytics/terms/us.html) and the legal obligations of their respective country.

## Installation and usage

To add autotrack to your site, you have to do two things:

1. Load the `ga-autotrack-id.js` script file included in this repo (or a [custom build](#custom-builds)) on your page.
2. Update your [tracking snippet](https://developers.google.com/analytics/devguides/collection/analyticsjs/tracking-snippet-reference) to [require](https://developers.google.com/analytics/devguides/collection/analyticsjs/using-plugins) the various autotrack plugins you want to use on the [tracker](https://developers.google.com/analytics/devguides/collection/analyticsjs/creating-trackers).

If your site is currently using the [default JavaScript tracking snippet](https://developers.google.com/analytics/devguides/collection/analyticsjs/tracking-snippet-reference), you can modify it to something like this:

```html
<script>
window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
ga('create', 'UA-XXXXX-Y', 'auto');

// Replace the following lines with the plugins you want to use.
ga('require', 'clientIdTracker');
ga('require', 'sessionIdTracker');
// ...

ga('send', 'pageview');
</script>
<script async src="https://www.google-analytics.com/analytics.js"></script>
<script async src="path/to/ga-autotrack-ids.js"></script>
```

Of course, you'll have to make the following modifications to the above code to customize autotrack to your needs:

- Replace `UA-XXXXX-Y` with your [tracking ID](https://support.google.com/analytics/answer/1032385)
- Replace the sample list of plugin `require` statements with the plugins you want to use.
- Replace `path/to/ga-autotrack-ids.js` with the actual location of the `ga-autotrack-ids.js` file hosted on your server.

**Note:** the [analytics.js plugin system](https://developers.google.com/analytics/devguides/collection/analyticsjs/using-plugins) is designed to support asynchronously loaded scripts, so it doesn't matter if `ga-autotrack-ids.js` is loaded before or after `analytics.js`. It also doesn't matter if the `ga-autotrack-ids.js` library is loaded individually or bundled with the rest of your JavaScript code.

### Loading autotrack via npm

If you use npm and a module loader that understands [ES2015 imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) (e.g. [Webpack](https://webpack.js.org/), [Rollup](http://rollupjs.org/), or [SystemJS](https://github.com/systemjs/systemjs)), you can include ga-autotrack-ids in your build by importing it as you would any other npm module:

```sh
npm install autotrack
```

```js
// In your JavaScript code
import 'ga-autotrack-ids';
```
**Note:** ga-autotrack-ids's source is published as ES2015, and you will need to make sure you're not excluding it from compilation.

The above `import` statement will include all autotrack plugins in your generated source file. If you only want to include a specific set of plugins, you can import them individually:

```js
// In your JavaScript code
import 'autotrack/lib/plugins/client-id-tracker';
import 'autotrack/lib/plugins/hit-id-tracker';
import 'autotrack/lib/plugins/session-id-tracker';
```

The above examples show how to include the autotrack plugin source in your site's main JavaScript bundle, which accomplishes the first step of the [two-step installation process](#installation-and-usage). However, you still have to update your tracking snippet and require the plugins you want to use on the tracker.

```js
// Import just the plugins you want to use.
import 'autotrack/lib/plugins/client-id-tracker';
import 'autotrack/lib/plugins/hit-id-tracker';
import 'autotrack/lib/plugins/session-id-tracker';

ga('create', 'UA-XXXXX-Y', 'auto');

// Only require the plugins you've imported above.
ga('require', 'hitIdTracker');
ga('require', 'clientIdTracker');
ga('require', 'sessionIdTracker');

ga('send', 'pageview');
```

#### Code splitting

Note that it's generally not a good idea to include any analytics as part of your site's main JavaScript bundle since analytics are not usually critical application functionality.

If you're using a bundler that supports code splitting (via something like `System.import()`), it's best to load autotrack plugins lazily and delay their initialization until after your site's critical functionality has loaded:

```js
window.addEventListener('load', () => {
  const autotrackPlugins = [
    'autotrack/lib/plugins/hit-id-tracker',
    'autotrack/lib/plugins/hit-timestamp-tracker',
    'autotrack/lib/plugins/client-id-tracker',
    // List additional plugins as needed.
  ];

  Promise.all(autotrackPlugins.map((x) => System.import(x))).then(() => {
    ga('create', 'UA-XXXXX-Y', 'auto');

    ga('require', 'hitIdTracker', {...});
    ga('require', 'hitTimestampTracker', {...});
    ga('require', 'clientIdTracker', {...});
    // Require additional plugins imported above.

    ga('send', 'pageview');
  });
})
```

If you're not sure how do use code splitting with your build setup, see the [custom builds](#custom-builds) section to learn how to manually generate a custom version of autotrack with just the plugins you need.

### Passing configuration options

All ga-autotrack-ids plugins take a configuration object with required options as the third parameter to the `require` command.

See the individual plugin documentation to reference what options each plugin accepts and/or requires.

## Advanced configuration

### Custom builds

Autotrack comes with its own build system, so you can create autotrack bundles containing just the plugins you need. Once you've [installed autotrack via npm](#loading-autotrack-via-npm), you can create custom builds by running the `ga-autotrack-ids` command.

For example, the following command generates an `ga-autotrack-ids.js` bundle and source map for just the `hitIdTracker`, and `hitTimestampTracker` plugins:

```sh
ga-autotrack=ids -o path/to/ga-autotrack-ids.custom.js -p hitIdTracker,hitTimestampTracker
```

Once this file is generated, you can include it in your HTML templates where you load `analytics.js`. Note the use of the `async` attribute on both script tags. This prevents `analytics.js` and `ga-autotrack-ids.custom.js` from interfering with the loading of the rest of your site.

```html
<script async src="https://www.google-analytics.com/analytics.js"></script>
<script async src="path/to/ga-autotrack-ids.custom.js"></script>
```

### Using autotrack with multiple trackers

All autotrack plugins support [multiple trackers](https://developers.google.com/analytics/devguides/collection/analyticsjs/creating-trackers#working_with_multiple_trackers) and work by specifying the tracker name in the `require` command. The following example creates two trackers and requires various autotrack plugins on each.

```js
// Creates two trackers, one named `tracker1` and one named `tracker2`.
ga('create', 'UA-XXXXX-Y', 'auto', 'tracker1');
ga('create', 'UA-XXXXX-Z', 'auto', 'tracker2');

// Requires plugins on tracker1.
ga('tracker1.require', 'hitIdTracker');
ga('tracker1.require', 'hitTimestampTracker');

// Requires plugins on tracker2.
ga('tracker2.require', 'hitIdTracker');
ga('tracker2.require', 'hitTimestampTracker');
ga('tracker2.require', 'clientIdTracker');

// Sends the initial pageview for each tracker.
ga('tracker1.send', 'pageview');
ga('tracker2.send', 'pageview');
```
