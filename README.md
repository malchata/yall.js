# yall.js (Yet Another Lazy Loader)

<p align="center">
  <strong>ES5 (.js) version</strong>
</p>
<p align="center">
  <img src="https://img.badgesize.io/malchata/yall.js/main/dist/yall.min.js?label=Uncompressed" alt="Uncompressed size.">&nbsp;<img src="https://img.badgesize.io/malchata/yall.js/main/dist/yall.min.js?compression=gzip&label=gzip" alt="gzip size.">&nbsp;<img src="https://img.badgesize.io/malchata/yall.js/main/dist/yall.min.js?compression=brotli&label=brotli" alt="Brotli size.">
</p>
<p align="center">
  <strong>ES6 (.mjs) version</strong>
</p>
<p align="center">
  <img src="https://img.badgesize.io/malchata/yall.js/main/dist/yall.min.mjs?label=Uncompressed" alt="Uncompressed size.">&nbsp;<img src="https://img.badgesize.io/malchata/yall.js/main/dist/yall.min.mjs?compression=gzip&label=gzip" alt="gzip size.">&nbsp;<img src="https://img.badgesize.io/malchata/yall.js/main/dist/yall.min.mjs?compression=brotli&label=brotli" alt="Brotli size.">
</p>

**Note: Barring any bugfixes, development of yall.js is done. Additionally, consider using [native lazy loading](https://web.dev/native-lazy-loading/) instead of any JavaScript-based solution unless you need to lazy load resources other than images and iframes.**

yall.js is a featured-packed SEO-friendly lazy loader for `<img>`, `<picture>`, `<video>` and `<iframe>` elements, as well as CSS background images. It works in all modern browsers, including IE 11. It uses [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) where available, but as of version 3, this API must be polyfilled for older browsers. It can also monitor the DOM for changes using [Mutation Observer](https://hacks.mozilla.org/2012/05/dom-mutationobserver-reacting-to-dom-changes-without-killing-browser-performance/) to lazy load elements that have been appended to the DOM after initial load, which may be desirable for single page applications. It can also optimize use of browser idle time using [`requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback), and reduces jank by using [`requestAnimationFrame`](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).

To use yall, grab `yall.min.js` (or `yall.min.mjs` if you're the modern sort) from the `dist` directory and slap it on your page. You can also install it with npm:

```shell
npm install yall-js
```

## Usage

This is version 3 of yall.js, and introduces breaking changes over all prior versions. This is simplest way to initialize yall.js:

```javascript
document.addEventListener("DOMContentLoaded", yall);
```

The above syntax is sufficient if you don't want to pass in any options. [If you _do_ want to specify options](#api-options), you'll need to use a slightly more verbose syntax:

```javascript
document.addEventListener("DOMContentLoaded", function() {
  yall({
    observeChanges: true
  });
});
```

Unlike version 2 which provided a fallback for browsers without `IntersectionObserver` support, version 3 doesn't. If you need to support browsers that don't support `IntersectionObserver`, you can conditionally polyfill this feature through [polyfill.io](https://polyfill.io/) like so:

```html
<script src="https://polyfill.io/v2/polyfill.min.js?features=IntersectionObserver"></script>
```

From there, lazy loading elements depends on _what_ you want to lazy load. Let's take a look at what you can do with it.

### `<img>`

Here's a typical `<img>` element use case:

```html
<!-- An src-only <img> element example -->
<img class="lazy" src="placeholder.jpg" data-src="image-to-lazy-load.jpg" alt="Alternative text to describe image.">
```

Here, we specify an optional placeholder image in the `src` attribute, and point to the image we want to lazy load in the `data-src` attribute. Attaching a `class` of `lazy` exposes elements to yall.js, and is necessary for the lazy loader to work (although this class can be overridden in the options). Let's look at an example using both `src` and `srcset`:

```html
<!-- A somewhat more complex src + srcset example -->
<img class="lazy" src="placeholder.jpg" data-srcset="image-to-lazy-load-2x.jpg 2x, image-to-lazy-load-1x.jpg 1x" data-src="image-to-lazy-load-1x.jpg" alt="Alternative text to describe image.">
```

Mostly the same as before, just another `data-` attributes for `srcset` is all.

**Note:** If you're using `media` and `sizes` attributes, _do not_ prefix them with `data-`. Leave them as-is.

### `<picture>`

Since `<picture>` is a thing, yall.js supports that, too:

```html
<!-- A more complex <picture> + <img> + src/srcset example -->
<picture>
  <source data-srcset="image-to-lazy-load-2x.webp 2x, image-to-lazy-load-1x.webp 1x" type="image/webp">
  <img class="lazy" src="placeholder.jpg" data-srcset="image-to-lazy-load-2x.jpg 2x, image-to-lazy-load-1x.jpg 1x" data-src="image-to-lazy-load-1x.jpg" alt="Alternative text to describe image.">
</picture>
```

Not too much different than the `<img>` use cases, except you're pointing to the images you want to load in the `<source>` element(s) as well as the `<img>` element.

### `<video>`

yall.js covers two possible lazy loading patterns for video.

#### Lazy-loading videos intended as replacements for animated GIFs

yall.js can lazy load `<video>` elements intended to [replace animated GIFs with autoplaying videos](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/replace-animated-gifs-with-video/):

```html
<video class="lazy" autoplay loop muted playsinline>
  <source data-src="video.webm" type="video/webm">
  <source data-src="video.mp4" type="video/mp4">
</video>
```

The pattern is largely the same as it is with `<picture>`, only the `lazy` class is applied to the `<video>` element. **Tip:** If you're embedding videos that _don't_ emulate animated GIFs (i.e., non autoplaying video), it's better to _not_ lazy load them. Instead, use the [`preload` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attr-preload) to defer loading of video content. Please also note that video autoplay policies can change at any time, meaning your video may not autoplay on some platforms! Such behaviors are not bugs, but rather features designed to respect users' bandwidth and preferences. Filing issues related to video autoplay issues will likely be rejected, as yall.js can't (and won't) override browser policies.

#### Lazy-loading `poster` placeholder images for non-autoplaying video

Sometimes you have video you'd rather not autoplay, such as those with an audio track. Or, perhaps you want to be more considerate of your user's bandwidth (how nice of you). In these cases, the [`poster` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attr-poster) can be used to load a placeholder image. However, these images can also be rather large, especially if you have a number of videos on the page that use this pattern. You can lazy load `poster` images with the following markup pattern:

```html
<video class="lazy" data-poster="placeholder.jpg" controls preload="none">
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
</video>
```

This pattern is slightly different than the one before it. Because we're not trying to emulate animated GIFs, we've removed a number of attributes from the `<video>` element that aren't necessary in this case:

1. We've done away with the usual `data-src` attribute, and specified `preload="none"` to ensure the browser doesn't preload any portion of the video (which, depending on the browser, can't be guaranteed).
2. To lazy load the `poster` image itself, we specify the image to load in a `data-poster` attribute.
3. The `controls` attribute is added here to allow the user to control video playback.

**Note:** For the sake of your users, don't mix the above markup patterns. If a video is going to use `autoplay` to replace an animated image, lazy loading a placeholder image via `data-poster` isn't necessary. Furthermore, if you're unsure of what to do, _let browsers handle this stuff and don't use yall.js to manage loading of videos at all!_

### `<iframe>`

You can also lazy load `<iframe>`s:

```html
<iframe class="lazy" data-src="some-other-document.html"></iframe>
```

### CSS images

Last, but not least, you can use yall.js to lazy load images referenced in CSS. This might be useful if you have a very large `background-image` you'd like to defer. Proper use of this feature requires _both_ HTML and CSS. To start, let's say you have a `<div>` that loads a very large masthead `background-image`:

```html
<!-- I bet this loads a giant stock photo! -->
<div class="masthead lazy-bg"></div>
```

The key here is the `lazy-bg` class, which is a class yall.js looks for (and can be changed in the options). When yall.js sees elements with this class, it will remove that class and replace it with a class of `lazy-bg-loaded` (also changeable in the options). From here, it's up to you to author CSS that makes use of this class to swap the image in. Such CSS might look like this:

```css
/* Pre-lazy loading styles */
.masthead {
  background: #e6e6e6; /* A little placeholder color */
  height: 16.66vw;
  margin: 0 0 1rem;
}

/* BAM! Lazy loaded! */
.masthead.lazy-bg-loaded {
  background: url("masthead.jpg");
}
```

This works because, unlike HTML which loads most resources regardless of their visibility, CSS loads resources only if the current layout builds a CSSOM which includes them. That means if your document's style tree changes later on to request a background image, the browser will fetch it the moment the change is applied. Leaning on this behavior is more sensible than using a mess of `data-` attributes pointing to possible image candidates, which could potentially add a bunch of extra markup and introduce edge cases that are difficult to code for.

## What about users without JavaScript?

Slap on some `<noscript>`:

```html
<!-- A <noscript> example using <img> with src and srcset. -->
<img class="lazy" data-srcset="/img/image-to-lazy-load-2x.jpg 2x, /img/image-to-lazy-load-1x.jpg 1x" data-src="/img/image-to-lazy-load-1x.jpg" src="/img/placeholder.jpg" alt="Alternative text to describe image.">
<noscript>
  <img srcset="/img/image-to-lazy-load-2x.jpg 2x, /img/image-to-lazy-load-1x.jpg 1x" src="/img/image-to-lazy-load-1x.jpg" alt="Alternative text to describe image.">
</noscript>

<!-- And a <picture> example. -->
<picture>
  <source data-srcset="/img/image-to-lazy-load-2x.webp 2x, /img/image-to-lazy-load-1x.webp 1x" type="image/webp">
  <img class="lazy" data-srcset="/img/image-to-lazy-load-2x.jpg 2x, /img/image-to-lazy-load-1x.jpg 1x" data-src="/img/image-to-lazy-load-1x.jpg" src="/img/placeholder.jpg" alt="Alternative text to describe image.">
</picture>
<noscript>
  <picture>
    <source srcset="/img/image-to-lazy-load-2x.webp 2x, /img/image-to-lazy-load-1x.webp 1x" type="image/webp">
    <img srcset="/img/image-to-lazy-load-2x.jpg 2x, /img/image-to-lazy-load-1x.jpg 1x" src="/img/image-to-lazy-load-1x.jpg" alt="Alternative text to describe image.">
  </picture>
</noscript>

<!-- Here's a <video> example, too. -->
<video class="lazy" autoplay loop muted playsinline>
  <source data-src="video.webm" type="video/webm">
  <source data-src="video.mp4" type="video/mp4">
</video>
<noscript>
  <video autoplay loop muted playsinline>
    <source src="video.webm" type="video/webm">
    <source src="video.mp4" type="video/mp4">
  </video>
</noscript>

<!-- Here's an <iframe> example for good measure. -->
<iframe class="lazy" data-src="lazy.html"></iframe>
<noscript>
  <iframe src="lazy.html"></iframe>
</noscript>
```

Then place a `no-js` class on the `<html>` element:

```html
<html class="no-js">
```

Finally, add this one line `<script>` before any `<link>` or `<style>` elements in the document `<head>`:

```html
<!-- Remove the no-js class on the <html> element if JavaScript is on -->
<script>document.documentElement.classList.remove("no-js")</script>
```

Normally, this script will remove the `no-js` class from the `<html>` element as the page loads, but if JavaScript is turned off, this never happens. From there, you can add some CSS that hides elements with a `class` of `lazy` when the `no-js` class is present on the `<html>` element:

```css
/* Hide .lazy elements if JavaScript is off */
.no-js .lazy {
  display: none;
}
```

To see all these examples in action, clone the repo, install packages, run `npm test`, and check out the demos on your local machine at [http://localhost:8080](http://localhost:8080).

## API options

When you call the main `yall` initializing function, you can pass an in an options object. Here are the current options available:

### `lazyClass`

**default:** `"lazy"`<br>
The element class used by yall.js to find elements to lazy load. Change this is if a `class` attribute value of `lazy` conflicts with your application.

### `lazyBackgroundClass`

**default:** `"lazy-bg"`<br>
The element class used by yall.js to find elements to lazy load CSS background images for. Change this if you'd prefer not to use the default.

### `lazyBackgroundLoaded`

**default:** `"lazy-bg-loaded"`<br>
When yall.js finds elements using the class specified by `lazyBackgroundClass`, it will remove that class and put this one in its place. This will be the class you use in your CSS to bring in your background image when the affected element is scrolled into the viewport.

### `idleLoadTimeout`

**default:** `200`<br>
In environments where `requestIdleCallback` is available, this option sets a deadline in milliseconds to kick off lazy loading for elements. If this is set to `0`, `requestIdleCallback` is never called, and lazy loading for elements will begin immediately once they're in the viewport.

### `threshold`

**default:** `200`<br>
The threshold (in pixels) for how far elements need to be within the viewport to begin lazy loading.

### `events`
**default:** `{}`<br>
An object of events that get sent directly to [`addEventListener`](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) for each element to be lazy loaded. Rather than building an opinionated, bespoke event management system, this system gets out of your way and lets you to specify whatever events are possible to bind with `addEventListener`. Here's an example below:

```javascript
document.addEventListener("DOMContentLoaded", function () {
  yall({
    events: {
      // The object key is sent as the first argument to `addEventListener`,
      // which is the event. The corresponding value can be the callback if you
      // don't want to send any options to `addEventListener`.
      load: function (event) {
        if (!event.target.classList.contains("lazy") && event.target.nodeName == "IMG") {
          event.target.classList.add("yall-loaded");
        }
      },
      // If we want to pass options to the third argument in `addEventListener`,
      // we can use a nested object syntax like so:
      error: {
        // Here, the `listener` member is the callback.
        listener: function (event) {
          if (!event.target.classList.contains("lazy") && event.target.nodeName == "IMG") {
            event.target.classList.add("yall-error");
          }
        },
        // The option below is sent as the third argument to `addEventListener`,
        // offering more control over how events are bound. If you want to
        // specify `useCapture` in lieu of options pass a boolean here instead.
        options: {
          once: true
        }
      }
    }
  });
});
```

Events for yall.js are bound at initialization time (often `DOMContentLoaded`). This means that some events _could_ fire multiple times, depending on the event. For instance, in the above `load` event example, you can see that we check for the default class of `lazy` on the element. This is because the `load` event could fire when the initial image placeholder loaded (if one is specified) _and_ when the final image is lazy loaded.

The advantage of this approach is that you can do pretty much anything you want in any of the events on the elements yall.js observes. The disadvantage is that it places the responsibility squarely on you to manage events. If you think yall.js has a bug in this behavior, do your due diligence to research whether your event callback code is buggy before filing issues.

### `observeChanges`

**default:** `false`<br>
Use a `MutationObserver` to monitor the DOM for changes. This is useful if you're using yall.js in a single page application and want to lazy load resources for markup injected into the page after initial page render.

### `observeRootSelector`

**default:** `"body"`<br>
If `observeChanges` is set to `true`, the value of this string is fed into `document.querySelector` to limit the scope in which the Mutation Observer looks for DOM changes. The `<body>` element is monitored by default, but you can confine the observer to any valid CSS selector (e.g., `#main-wrapper`).

### `mutationObserverOptions`

**default:** `{ childList: true, subtree: true }`<br>
Options to pass to the `MutationObserver` instance. Read [this MDN guide](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationObserverInit) for a list of options. It's very possible that changing this value could result in yall.js failing to lazy load resources that are appended to the DOM later on.

### `noPolyfill`

**default:** false
If `noPolyfill` is set to `true` yall.js will assume you are not polyfilling `IntersectionObserver`, and will subsequently load all resources when it detects no support for `IntersectionObserver`. This option will save you ~2.4kB for the `intersection-observer` polyfill, but be advised that invoking this option means that you could potentially load both placeholders _and_ the final image sources. Additionally, you'll be dependent on JavaScript to trigger immediate loading of all images in the document for browsers that don't support `IntersectionObserver`. For these reasons, it's only advised to enable this option if the vast majority of your users are on browsers that support `IntersectionObserver`.

## Words of advice

This script aims to provide a reasonable level of compatibility down to IE 11, but as stated previously, you will need to polyfill `IntersectionObserver` for yall.js to work in that browser. If you don't polyfill `IntersectionObserver`, non-supporting browsers won't throw an error, they'll fail silently. However, features that are natively available in at least IE 11 (such as `MutationObserver` and `requestAnimationFrame` will not be checked for, and _will_ throw errors if they are not available. For example, because `requestIdleCallback` is not available in IE 11, it _will_ be checked for. If it doesn't exist, it will simply not be used. Polyfill it if you need it.

Also, it is not this script's job to minimize layout shifting for you. [Use appropriate `width` and `height` attributes](https://www.smashingmagazine.com/2020/03/setting-height-width-images-important-again/), styles, and lightweight placeholders for your images.

In the case of `<video>`, avoid lazy loading a placeholder with the `data-poster` attribute for autoplaying videos and just use `poster`. On the other hand, _do_ consider lazy loading a placeholder image with `data-poster` for non-autoplaying videos. Or you can opt _not_ to use a `poster` image. Your website, your call.

Also, do _not_ lazy load resources that are likely to near the top of the page&mdash;or "above the fold", as it were. Doing so is an anti-pattern in that those resources will not begin loading until yall.js has been loaded, which may take much longer than if those resources were loaded normally.

## Integration

Here are some external libraries or extensions built on top `malchata/yall.js`.

- [`adhocore/twig-yall`](https://github.com/adhocore/twig-yall) - A twig template engine extension that makes integration of `malchata/yall.js` a breeze.

## Contributing

Please read the [contribution guidelines](https://github.com/malchata/yall.js/blob/master/CONTRIBUTING.md). If you think I'm some kind of grumpy crank after reading that, please remember that this is a hobby project you can use for free. Here's a couple other options for you if yall.js doesn't do what you need it to:

- [Lozad.js](https://github.com/ApoorvSaxena/lozad.js)
- [lazysizes](https://github.com/aFarkas/lazysizes)

## Special thanks

Thank you to [BrowserStack](https://www.browserstack.com/) for graciously providing free cross-platform browser testing services!
[![BrowserStack](https://res.cloudinary.com/drp9iwjqz/image/upload/f_auto,q_auto/v1527175969/browserstack_txnmf8.png)](https://www.browserstack.com/)
