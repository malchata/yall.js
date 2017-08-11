# yall.js (Yet Another Lazy Loader)
### (Y'all need to lazy load images)

yall.js is a very small image lazy loader for reasonably modern browsers (back to IE10) that weighs in at 1.24 KB uglified (621 bytes with gzip/507 bytes with Brotli). It depends on `classList`, `querySelectorAll`, supports the `<picture>` element and the `srcset` attribute. yall.js also uses `IntersectionObserver` if available, but will fall back to more traditional means if it's not. If you want to try out yall.js, grab the copy in the `dist` folder. Or you can clone the repo and check out the `test` folder. If you want to tinker, work with the copy in the `src` folder and build using `npm run build` (requires `npx`).

## Usage Pattern

yall.js assumes a lot, but because it does, it's very straightforward. Here's the simplest `<img>` element use case: Just add a class of `lazy` to an `<img>` element you want to lazy load, and point the `data-src` attribute to the desired image source:

```html
<img class="lazy" data-src="/img/image-to-lazy-load.jpg" src="/img/placeholder.jpg" alt="Alternative text to describe image.">
```

An optional (but recommended) placeholder can be specified in the `src` attribute. This will be replaced by the lazy loader when the element is scrolled into view.

You can also use yall.js on `srcset` attributes, too:

```html
<img class="lazy" data-srcset="/img/image-to-lazy-load-2x.jpg 2x, /img/image-to-lazy-load-1x.jpg 1x" data-src="/img/image-to-lazy-load-1x.jpg" src="/img/placeholder.jpg" alt="Alternative text to describe image.">
```

You can use it on `<picture>` elements, too!

```html
<picture>
  <source data-srcset="/img/image-to-lazy-load.webp" type="image/webp">
  <source data-srcset="/img/image-to-lazy-load.jpg" type="image/jpeg">
  <img data-src="/img/image-to-lazy-load.jpg" src="/img/placeholder.jpg" class="lazy" alt="Alternative text to describe image.">
</picture>
```

## What about users without JavaScript?

Easy! Slap on some `<noscript>` goodness:

```html
<img class="lazy" data-src="/img/image-to-lazy-load.jpg" src="/img/placeholder.jpg" alt="Alternative text to describe image.">
<noscript>
  <img src="/img/image-to-lazy-load.jpg" alt="Alternative text to describe image.">
</noscript>
```

Then place a `no-js` class on the `<html>` element, and finally add this JavaScript one-liner in the `<head>` of the document:

```html
<script>document.documentElement.classList.remove("no-js");</script>
```

This snippet will remove the `no-js` class from the `<html>` element as the page loads, but if JavaScript is turned off, this will never happen. From there, you can add some CSS that hides elements with a class of `lazy` when the `no-js` class is present on the `<html>` element:

```css
.no-js .lazy{
  display: none;
}
```

To see everything in action, check out the demos in the `test` folder.

## Limitations

yall.js will only attach listeners to markup that has been sent by the server. Lazy-loaded markup injected into the DOM using this pattern will not be recognized. This makes yall.js just fine for the vast majority of use cases, but if you have some really complex stuff going on, you should find a more feature-rich lazy loader.

yall.js also doesn't try to guess at placeholder sizes to minimize layout shifting. I would *highly recommend* you specify a placeholder `src` in your `<img>` tags, or develop a CSS placeholder solution. For example, you could serve an extremely low quality version of an image that has a heavy gaussian blur effect. This technique signals to the user that an image will appear in that space, but doesn't push many extra bytes down the wire.

## Contributing

I'm not interested in expanding the functionality by much unless a good case can be made for increasing its performance without making it huge. The goal of yall.js is to be as small as reasonably possible while maintaining functionality. If you look at the source and can find ways to make this script's uglified output smaller than it already is without breaking it, I welcome your contributions.

## Special thanks

Props to [Kamran Ayub](https://github.com/kamranayub) for his tremendous help with performance tuning this script.

## Why another dumb lazy loader?

I explain how to write a lazy loader in Chapter 6 of my book [Web Performance in Action](https://www.manning.com/books/web-performance-in-action?a_aid=webopt&a_bid=63c31090) from Manning Publications. Otherwise, I wouldn't have bothered. The lazy loader in the book is much different than what you'll find here.
