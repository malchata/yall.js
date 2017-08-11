# yall.js (Yet Another Lazy Loader)
### (Y'all need to lazy load images)

yall.js is a very small image lazy loader for reasonably modern browsers (back to IE10) that weighs in at **1.09 KB** uglified. It depends on `classList`, `querySelectorAll`, supports the `<picture>` element and the `srcset` attribute. yall.js also uses `IntersectionObserver` if available, but will fall back to more traditional means if it's not. If you want to try out yall.js, grab the copy in the `dist` folder. Or you can clone the repo and check out the `test` folder. If you want to tinker, work with the copy in the `src` folder and build using `npm run build` (requires `npx`).

## Usage Pattern

yall.js assumes a lot, but because it does, it's very straightforward. Here's the simplest `<img>` element use case. All you need to do is add a class of `lazy` to the `<img>` element you want to place lazy loading behavior on, and point the `data-src` attribute to an image source to lazy load:

```html
<img class="lazy" data-src="/img/image-to-lazy-load.jpg" src="/img/placeholder.jpg" alt="Alternative text to describe image.">
```

An optional placeholder can be specified in the `src` attribute. This will be replaced by the lazy loader when the element is scrolled into view.

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

Easy solution. Slap on some `<noscript>` goodness:

```html
<img class="lazy" data-src="/img/image-to-lazy-load.jpg" src="/img/placeholder.jpg" alt="Alternative text to describe image.">
<noscript>
  <img src="/img/image-to-lazy-load.jpg" alt="Alternative text to describe image.">
</noscript>
```

Then slap a `no-js` class onto the `<html>` element, and add this JavaScript one-liner in the `<head>` of the document:

```html
<script>document.documentElement.classList.remove("no-js");</script>
```

From here, you can add some CSS that hides elements with a class of `lazy` when the `no-js` class is present on the `<html>` element:

```css
.no-js .lazy{
  display: none;
}
```

If you want to see everything in action, check out the demo in the `test` folder.

## Limitations

Yall.js will only attach listeners to markup that has been sent by the server. Lazy-loaded markup injected into the DOM using this pattern will not be recognized. This makes yall.js just fine for the vast majority of use cases, but if you have some complex rendering and injection going on, you should find a more feature-rich lazy loader. I don't have any intention to add this functionality.

Yall.js also doesn't try to guess at placeholder sizes to minimize disruption to the DOM. I would highly recommend you specify a placeholder `src` in your `<img>` tags. For example, you could serve an extremely low quality version of an image that has a heavy gaussian blur effect. This technique signals to the user that an image will appear in that space, but doesn't push many extra bytes down the wire.

## Contributing

I'm not interested in expanding the functionality of this package or refactoring it for readability. The goal of yall.js is to be as *small as humanly possible* while maintaining functionality. This means the source may not be the most readable. If you look at the source and can find ways to make this library more terse than it already is without breaking it, I welcome your contributions.

## Special thanks

Props to [Kamran Ayub](https://github.com/kamranayub) for breaking the 1 KB barrier. Good lord, is he good at JS.

## Why another dumb lazy loader?

I explain how to write a lazy loader in Chapter 6 of my book [Web Performance in Action](https://www.manning.com/books/web-performance-in-action?a_aid=webopt&a_bid=63c31090) from Manning Publications. Otherwise, I wouldn't have bothered.
