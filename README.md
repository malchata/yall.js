# yall.js (Yet Another Lazy Loader)
### (Y'all need to lazy load images)

[![Build Status](https://travis-ci.org/malchata/yall.js.svg?branch=master)](https://travis-ci.org/malchata/yall.js)

yall.js is a very small image and video lazy loader for reasonably modern browsers (back to IE11) that weighs in at 1.18 KB uglified (688 bytes with gzip/568 bytes with Brotli). It uses `classList`, `querySelector`. It supports lazy loading `<img>` and `<picture>` with `src`/`srcset`, as well as `<video>`. yall.js will also use `IntersectionObserver` if available, but will fall back to throttled `scroll`/`resize` event handlers if it's not. If you want to try out yall.js, [grab a copy from the releases tab](https://github.com/malchata/yall.js/releases). Or clone the repo and check out the `test` folder. If you want to tinker, work with the source in the `src` folder and build using `npm run build` (requires [`npx`](https://www.npmjs.com/package/npx)).

## Usage Pattern

yall.js assumes a lot, but because it does, it's very straightforward. Here's the simplest `<img>` element use case: Just add a class of `lazy` to an `<img>` element you want to lazy load, and point the `data-src` attribute to the desired image source:

```html
<!-- Simple <img> example -->
<img class="lazy" data-src="/img/image-to-lazy-load.jpg" src="/img/placeholder.jpg" alt="Alternative text to describe image.">
```

An optional (but recommended) placeholder can be specified in the `src` attribute, which will be replaced by yall.js when the image is lazily loaded. If you go this route, be sure to specify `width` and `height` attributes to minimize layout shifting.

You can also use yall.js on `srcset` attributes, too:

```html
<!-- A somewhat more complex <img> + srcset example -->
<img class="lazy" data-srcset="/img/image-to-lazy-load-2x.jpg 2x, /img/image-to-lazy-load-1x.jpg 1x" data-src="/img/image-to-lazy-load-1x.jpg" src="/img/placeholder.jpg" alt="Alternative text to describe image.">
```

You can use it on `<picture>` elements, too!

```html
<!-- A more complex <picture> + <img> + srcset example -->
<picture>
  <source data-srcset="/img/image-to-lazy-load.webp" type="image/webp">
  <source data-srcset="/img/image-to-lazy-load.jpg" type="image/jpeg">
  <img data-src="/img/image-to-lazy-load.jpg" src="/img/placeholder.jpg" class="lazy" alt="Alternative text to describe image.">
</picture>
```

And now as of the 1.2.0 release, you can use it on `<video>` elements! This is useful if you are replacing animated GIFs with autoplaying videos (which are usually much smaller).

```html
<!-- Lazy load that video! -->
<video class="lazy" autoplay loop muted>
	<source data-src="video.webm" type="video/webm">
	<source data-src="video.ogv" type="video/ogg">
	<source data-src="video.mp4" type="video/mp4">
</video>
```

The pattern is largely the same as it is with the `<picture>` use case, only the `lazy` class is applied to the `<video>` element. **Pro tip:** If you're embedding videos that don't emulate animated GIF behavior (i.e., non autoplaying video), it's probably best to lean on the `preload` attribute to defer loading rather than using yall.js. Read more about `preload` [in the MDN docs](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video).

## What about users without JavaScript?

Easy! Slap on some `<noscript>` goodness:

```html
<!-- For users without JavaScript -->
<img class="lazy" data-src="/img/image-to-lazy-load.jpg" src="/img/placeholder.jpg" alt="Alternative text to describe image.">
<noscript>
  <img src="/img/image-to-lazy-load.jpg" alt="Alternative text to describe image.">
</noscript>

<!-- Here's a <video> example, too -->
<video class="lazy" autoplay loop muted>
	<source data-src="video.webm" type="video/webm">
	<source data-src="video.ogv" type="video/ogg">
	<source data-src="video.mp4" type="video/mp4">
</video>
<noscript>
	<video autoplay loop muted>
		<source src="video.webm" type="video/webm">
		<source src="video.ogv" type="video/ogg">
		<source src="video.mp4" type="video/mp4">
	</video>
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

## Limitations

yall.js will only attach listeners to markup sent by the server. Lazy-loaded markup injected into the DOM using this pattern will not be recognized. This makes yall.js just fine for the vast majority of use cases, but if you have really complex stuff going on (such as SPA environments), you should find a more feature-rich lazy loader. Eventually, I will modify yall.js to expose methods to destroy/init.

yall.js also doesn't try to guess at placeholder sizes to minimize layout shifting. I would _highly recommend_ you specify a placeholder `src` in your `<img>` tags, or develop a CSS placeholder solution. For example, you could serve an extremely low quality version of an image that has a heavy gaussian blur effect. This technique signals to the user that an image will appear in that space, but doesn't push many extra bytes down the wire.

## Contributing

If you have an idea, file an issue and let's talk about it. Unsolicited pull requests for new features will generally be rejected, unless those requests contain bug fixes. Generally speaking, I want to avoid adding new features in lieu of keeping this library very, very small.

## Special thanks

Props to [Kamran Ayub](https://github.com/kamranayub) for his tremendous help with performance tuning this script, and to [Anthony Gore](https://twitter.com/anthonygore) for fixing an elusive bug in my `IntersectionObserver` code where sometimes the last image on a page would not lazy load.

## Why another dumb lazy loader?

I explain how to write a lazy loader in Chapter 6 of my book [Web Performance in Action](https://www.manning.com/books/web-performance-in-action?a_aid=webopt&a_bid=63c31090) from Manning Publications. Otherwise, I wouldn't have bothered. The lazy loader in the book is much different (and less powerful) than what you'll find here.
