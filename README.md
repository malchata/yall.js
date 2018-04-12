# yall.js (Yet Another Lazy Loader)

[![Build Status](https://travis-ci.org/malchata/yall.js.svg?branch=shadowfax)](https://travis-ci.org/malchata/yall.js) ![](http://img.badgesize.io/malchata/yall.js/shadowfax/dist/yall-2.0.0b.min.js?label=Uncompressed) ![](http://img.badgesize.io/malchata/yall.js/shadowfax/dist/yall-2.0.0b.min.js?compression=gzip&label=gzip)

**Warning: This is a beta version, and has not been extensively tested in all browsers. It is _not_ production ready!**

yall.js is a featured-packed lazy loading library for `<img>`, `<picture>`, `<video>` and `<iframe>` elements, and works in all modern browsers plus IE11. It uses [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) where available, but falls back to `scroll`, `touchmove`, `resize`, and `orientationchange` events where necessary. It also queries the DOM using `querySelector` and `querySelectorAll`. It can also monitor the DOM for changes using [Mutation Observer](https://hacks.mozilla.org/2012/05/dom-mutationobserver-reacting-to-dom-changes-without-killing-browser-performance/) to lazy load image elements that have been appended to DOM after initial page render, which can be desirable for single page applications. It can also (optionally) optimize use of browser idle time using [`requestIdleCallback`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback).

## Usage

This is version 2 of yall.js, and introduces some breaking changes over version 1. While the first version only required you to include the script and tag elements with a special class, this script needs to be explicitly initialized like so:

```html
<script src="yall.min.js"></script>
<script>document.addEventListener("DOMContentLoaded", yall);</script>
```

The above syntax is sufficient if you don't want to pass in any options. [If you want to specify some options](#api-options), however, you'll need to use a slightly more verbose syntax:

```html
<script src="yall.min.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", function() {
    yall({
      observeChanges: true
    });
  });
</script>
```

Lazy loading elements with yall is simple! Let's look at the simplest `<img>` element use case:

```html
<!-- A simple src-only <img> element example -->
<img class="lazy" src="placeholder.jpg" data-src="image-to-lazy-load.jpg" alt="Alternative text to describe image.">
```

In this case, we specify an optional placeholder image in the `src` attribute, and point to the image we want to lazy load in the `data-src` attribute. Attaching a `class` of `lazy` exposes elements to yall.js, and is necessary for the lazy loader to work (although this class value can be overridden via the API options). Let's look at an example using both `src` and `srcset`:

```html
<!-- A somewhat more complex src + srcset example -->
<img class="lazy" src="placeholder.jpg" data-srcset="image-to-lazy-load-2x.jpg 2x, image-to-lazy-load-1x.jpg 1x" data-src="image-to-lazy-load-1x.jpg" alt="Alternative text to describe image.">
```

Since `<picture>` is a thing now, yall.js supports that, too:

```html
<!-- A more complex <picture> + <img> + src/srcset example -->
<picture>
  <source data-srcset="image-to-lazy-load-2x.webp 2x, image-to-lazy-load-1x.webp 1x" type="image/webp">
  <img class="lazy" src="placeholder.jpg" data-srcset="image-to-lazy-load-2x.jpg 2x, image-to-lazy-load-1x.jpg 1x" data-src="image-to-lazy-load-1x.jpg" alt="Alternative text to describe image.">
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

_**Note:** These are not stable, yet! Some may change before version 2 is out of beta!_

When you call the main `yall` initializing function, you can pass an object in with some configuration options. Here are the current options available:

- `lazyClass` (default is `"lazy"`): The element class used by yall.js to find elements to lazy load. Change this is if a class attribute value of `lazy` conflicts with your application.
- `throttleTime` (default is `200`): In cases where Intersection Observer isn't available, standard event handlers are used. `throttleTime` allows you to control how often the code within these event handlers fire in milliseconds.
- `idlyLoad` (default is `false`): If set to `true`, `requestIdleCallback` is used to optimize use of browser idle time to limit monopolization of the main thread. _**Note:** Enabling this could cause lazy loading to be delayed significantly more than you might be okay with! This option trades off some degree of seamless lazy loading in favor of optimized use of browser idle time. Test extensively!_
- `idleLoadTimeout` (default is `100`): If `idlyLoad` is set to `true`, this option sets a deadline in milliseconds for `requestIdleCallback` to kick off lazy loading for an element.
- `threshold` (default is `200`): The threshold (in pixels) for how far elements need to be within the viewport to begin lazy loading. This value affects lazy loading using Intersection Observer, as well as for legacy loading behavior relying on event handlers.
- `observeChanges` (default is `false`): Use a Mutation Observer to examine the DOM for changes. This is useful if you're using yall.js in a single page application and want to lazy load resources for markup injected into page after the initial page render. _**Note:** This option is ignored if set to `true` in a browser that doesn't support Mutation Observer!_
- `observeRootSelector` (default is `"body"`): If `observeChanges` is set to `true`, the value of this string is fed into `document.querySelector` to limit the scope in which the Mutation Observer looks for DOM changes. `document.body` is inferred by default, but you can confine it to any valid CSS selector (e.g., `div#main-wrapper`).
- `mutationObserverOptions` (default is `{childList: true}`): Options to pass to the `MutationObserver` instance. Read [this MDN guide](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver#MutationObserverInit) for a list of options.
- `intersectionObserverOptions` (default is `{rootMargin: ${options.threshold}px 0%}`): Options to pass to the `IntersectionObserver` instance. Read [this MDN guide](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#Intersection_observer_options) for a list of options. _**Note:** You are probably better off not modifying this, as doing so could drop the `rootMargin` value if you're not careful. Future developments will probably incorporate specific options to pass into the API to avoid detrimental effects to functionality._

## Limitations

Currently, yall.js doesn't provide an error handling mechanism. I'm currently trying to decide if this is worth implementing. In the meantime, you may want to make use of an inline `onerror` handler in your code.

Additionally, yall.js also doesn't care about placeholders, and it won't try to minimize layout shifting or perform any layout calculations for you. The recommended method is to use a placeholder method such as [LQIP](https://www.guypo.com/introducing-lqip-low-quality-image-placeholders/) or [SQIP](https://github.com/technopagan/sqip) to fill the image space prior to lazy loading in conjunction with appropriate `width` and `height` attributes on elements. For `<video>` elements, use the `poster` attribute set a placeholder image. Please check out `index.html` in the `test` folder to see how you might use placeholders in conjunction with yall.js. If you don't want to bother with placeholders, you can omit the `src` attribute entirely in your lazy loading markup and yall.js will still work. Alternatively, you could calculate placeholder size in CSS using the `padding-top` trick.

## Contributing

If you have an idea, file an issue and let's talk about it. Unsolicited pull requests for new features will generally be rejected unless those requests contain bug fixes.
