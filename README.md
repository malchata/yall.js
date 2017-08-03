# yall.js (Yet Another Lazy Loader)
### (Y'all need to lazy load images)

yall.js is a very small image lazy loader for reasonably modern browsers (IE10+ and everything else) that weighs in at 861 bytes uglified. It depends on `classList`, `querySelectorAll`, supports the `<picture>` element and the `srcset` attribute. To use, grab the copy in the `dist` folder. If you want to tinker, work with the copy in the `src` folder and transpile with gulp (or babel-cli).

## Usage Pattern

yall.js assumes a lot, but because it does, it's very straightforward. Here's the simplest `<img>` element use case. All you need to do is add a class of `lazy` to the `<img>` element you want to place lazy loading behavior on, and point the `data-src` attribute to an image source to lazy load:

```html
<img class="lazy" data-src="/img/image-to-lazy-load.jpg" src="/img/placeholder.jpg">
```

An optional placeholder can be specified in the `src` attribute. This will be replaced by the lazy loader when the element is scrolled into view.

You can also use yall.js on `srcset` attributes, too:

```html
<img class="lazy" data-srcset="/img/image-to-lazy-load-2x.jpg 2x, /img/image-to-lazy-load-1x.jpg 1x" data-src="/img/image-to-lazy-load-1x.jpg" src="/img/placeholder.jpg">
```

You can use it on `<picture>` elements, too!

```html
<picture>
  <source data-srcset="/img/image-to-lazy-load.webp" type="image/webp">
  <source data-srcset="/img/image-to-lazy-load.jpg" type="image/jpeg">
  <img data-src="/img/image-to-lazy-load.jpg" src="/img/placeholder.jpg" class="lazy">
</picture>
```

## What about users without JavaScript?

Easy solution. Slap on some `<noscript>` goodness:

```html
<img class="lazy" data-src="/img/image-to-lazy-load.jpg" src="/img/placeholder.jpg">
<noscript>
  <img src="/img/image-to-lazy-load.jpg">
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

## Contributing

I'm not interested in expanding the functionality of this package or refactoring it for readability. The goal of yall.js is to be as *small as humanly possible* while maintaining functionality. This means the source may not be the most readable. If you look at the source and can find ways to make this library more terse than it already is without breaking it, I welcome your contributions.

## Special thanks

Props to [Kamran Ayub](https://github.com/kamranayub) for breaking the 1 KB barrier. Good lord, is he good at JS.

## Why another dumb lazy loader?

I explain how to write a lazy loader in Chapter 6 of my book [Web Performance in Action](https://www.manning.com/books/web-performance-in-action?a_aid=webopt&a_bid=63c31090) from Manning Publications. Otherwise, I wouldn't have bothered.
