# yall.js (Yet Another Lazy Loader)
### (Y'all need to lazy load images)

yall.js is a teeny lazy loader that weighs in at 1.51 KB uglified (and less when compressed). It depends on `classList` and supports the `<picture>` element and the `srcset` attribute. To use it, grab the copy in the `dist` folder. To fork and develop, use the copy in the `src` folder and compile using gulp (or babel-cli).

## Usage Pattern

Using yall.js is super duper easy. Here's the most basic `<img>` tag case. All you need to do is add a class of `lazy` to the `<img>` element you want to place lazy loading behavior on, and point the `data-src` attribute to an image source to lazy load:

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
  <source data-srcset="/img/image-to-lazy-load.jpeg" type="image/jpeg">
  <img data-src="/img/image-to-lazy-load.jpeg" src="/img/placeholder.jpg" class="lazy">
</picture>
```

## What about users without JavaScript?

Easy solution. Slap on some `<noscript>` goodness:

```html
<img class="lazy" data-src="/img/image-to-lazy-load.jpg" src="/img/placeholder.jpg">
<noscript>
  <img src="/img/image-to-lazy-load.jpg">
<noscript>
```

Then slap a `no-js` tag onto the `<html>` element. Then in the `<head>` of the document, add this little snippet of code:

```html
<script>document.documentElement.classList.remove("no-js");</script>
```

From here, you can write some CSS that hides elements with a class of `lazy` when the `no-js` class is present on the document:

```css
.no-js .lazy{
  display: none;
}
```

## Why another dumb lazy loader?

I explain how to write a lazy loader in Chapter 6 of my book [Web Performance in Action](https://www.manning.com/books/web-performance-in-action?a_aid=webopt&a_bid=63c31090) from Manning Publications. Otherwise, I wouldn't have bothered.
