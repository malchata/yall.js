# yall.js (Yet Another Lazy Loader)

[![Build Status](https://travis-ci.org/malchata/yall.js.svg?branch=shadowfax)](https://travis-ci.org/malchata/yall.js)

yall.js is a featured-packed lazy loading library for `<img>`, `<picture>`, `<video>` and `<iframe>` elements. It uses [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) where available, but falls back to `scroll`, `touchmove`, `resize`, and `orientationchange` events where necessary. It can also watch the DOM for changes using [Mutation Observer](https://hacks.mozilla.org/2012/05/dom-mutationobserver-reacting-to-dom-changes-without-killing-browser-performance/) to lazy load image elements that have been appended to DOM after initial page render, which can be desirable for single page applications. It can also (optionally) optimize use of browser idle time using [`requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback).

yall.js is reasonably small at around ~3.3 KB uglified and uncompressed. When compressed with gzip or Brotli, yall.js can be as small as ~1 KB.

## Usage

This is version 2 of yall.js, and introduces some breaking changes. While version 1 only required you to include the script and tag elements with a special class, this script needs to be explicitly initialized like so:

```html
<script src="yall.min.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", function() {
    yall(); // Options can be passed into this function call!
  });
</script>
```

Lazy loading elements with yall is simple! Let's look at the simplest `<img>` element use case:

```html
<!-- A simple src-only <img> element example -->
<img class="lazy" src="placeholder.jpg" data-src="image-to-lazy-load.jpg">
```

In this case, we specify an optional placeholder image in the `src` attribute, and point to the image we want to lazy load in the `data-src` attribute. Attaching a `class` of `lazy` exposes elements to yall.js, and is necessary for the lazy loader to work (although this class value can be overridden via the API options). Let's look at an example using both `src` and `srcset`:

```html
<!-- A somewhat more complex src + srcset example -->
<img class="lazy" src="placeholder.jpg" data-srcset="image-to-lazy-load-2x.jpg 2x, image-to-lazy-load-1x.jpg 1x" data-src="image-to-lazy-load-1x.jpg">
```

Since `<picture>` is a thing now, yall.js supports that, too:

```html
<!-- A more complex <picture> + <img> + src/srcset example -->
<picture>
  <source data-srcset="image-to-lazy-load-2x.webp 2x, image-to-lazy-load-1x.webp 1x" type="image/webp">
  <img class="lazy" src="placeholder.jpg" data-srcset="image-to-lazy-load-2x.jpg 2x, image-to-lazy-load-1x.jpg 1x" data-src="image-to-lazy-load-1x.jpg">
</picture>
```

You can also use yall.js to lazy load `<video>` elements! This is useful if you are replacing animated GIF with autoplaying video:

```html
<video class="lazy" autoplay loop muted playsinline>
  <source data-src="video.webm" type="video/webm">
  <source data-src="video.mp4" type="video/mp4">
</video>
```

The pattern is largely the same as it is with the `<picture>` use case, only the `lazy` class is applied to the `<video>` element. **Pro tip**: If you're embedding videos that don't emulate animated GIF behavior (i.e., non autoplaying video), it's better to lean on the [`preload` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video#attr-preload) to defer loading rather than using yall.js.

As of version 2, you can also lazy load `<iframe>` elements! This looks pretty much just like a simple `<img>` example:

```html
<iframe class="lazy" data-src="some-other-document.html">
```

## What about users without JavaScript?

Easy! Slap on some `<noscript>` goodness:

```html
<!-- For users without JavaScript -->
<img class="lazy" data-src="/img/image-to-lazy-load.jpg" src="/img/placeholder.jpg" alt="Alternative text to describe image.">
<noscript>
  <img src="/img/image-to-lazy-load.jpg" alt="Alternative text to describe image.">
</noscript>

<!-- Here's a <video> example, too -->
<video class="lazy" autoplay loop muted playsinline>
	<source data-src="video.webm" type="video/webm">
	<source data-src="video.ogv" type="video/ogg">
	<source data-src="video.mp4" type="video/mp4">
</video>
<noscript>
	<video autoplay loop muted playsinline>
		<source src="video.webm" type="video/webm">
		<source src="video.ogv" type="video/ogg">
		<source src="video.mp4" type="video/mp4">
	</video>
</noscript>

<!-- Here's an <iframe> example for good measure -->
<iframe class="lazy" data-src="lazy.html"></iframe>
<noscript>
  <iframe src="lazy.html"></iframe>
</noscript>
```

Then place a `no-js` class on the `<html>` element, and finally add this JavaScript one-liner in the `<head>` of the document:

```html
<!-- Remove the no-js class on the <html> element if JavaScript is on -->
<script>document.documentElement.classList.remove("no-js");</script>
```

This snippet will remove the `no-js` class from the `<html>` element as the page loads, but if JavaScript is turned off, this will never happen. From there, you can add some CSS that hides elements with a class of `lazy` when the `no-js` class is present on the `<html>` element:

```css
/* Hide .lazy elements if JavaScript is off */
.no-js .lazy{
  display: none;
}
```

To see all use cases in action, check out the demos in the `test` folder and go from there.

## API options

When you call the main `yall` initializing function, you can pass an object in with some configuration options. Here are the current options available:

- `lazyClass` (default is `"lazy"`): The element class used by yall.js to find elements to lazy load. Change this is if a class attribute value of `lazy` conflicts with your application.
- `throttleTime` (default is `200`): In cases where Intersection Observer isn't available, standard event handlers are used. `throttleTime` allows you to control how often the code within these event handlers fire in milliseconds.
- `idlyLoad` (default is `false`): If set to `true`, `requestIdleCallback` is used to optimize use of browser idle time to limit monopolization of the main thread. _Note: Enabling this could cause lazily loading to be delayed significantly more than you might be okay with! Test extensively!_
- `idleLoadTimeout` (default is `100`): If `idlyLoad` is set to `true`, this option sets a deadline in milliseconds for `requestIdleCallback` to kick off lazy loading for an element.
- `observeChanges` (default is `false`): Use a Mutation Observer to examine the DOM for changes. This is useful if you're using yall.js in a single page application and want to lazy load resources for markup injected into page after the initial page render. _Note: This option is ignored if set to `true` in a browser that doesn't support Mutation Observer!_
- `observeRootSelector` (default is `"body"`): If `observeChanges` is set to `true`, the value of this string is fed into `document.querySelector` to limit the scope in which the Mutation Observer looks for DOM changes. `document.body` is inferred by default, but you can confine it to any valid CSS selector (e.g., `div#main-wrapper`).

## Contributing

If you have an idea, file an issue and let's talk about it. Unsolicited pull requests for new features will generally be rejected unless those requests contain bug fixes.
