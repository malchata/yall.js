/**
 * yall.js version 2.2.2
 * Yet Another Lazy loader
 **/

// The eponymous function
function yall (userOptions) {
  // Environmental stuff. Stores feature support information, as well as other
  // stuff yall needs to refer to during operation.
  const env = {
    intersectionObserverSupport: "IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype,
    mutationObserverSupport: "MutationObserver" in window,
    idleCallbackSupport: "requestIdleCallback" in window,
    eventsToBind: [
      [document, "scroll"],
      [document, "touchmove"],
      [window, "resize"],
      [window, "orientationchange"]
    ]
  };

  // Default options, merged with user options.
  const options = {
    lazyClass: "lazy",
    lazyBackgroundClass: "lazy-bg",
    lazyBackgroundLoaded: "lazy-bg-loaded",
    throttleTime: 200,
    idlyLoad: false,
    idleLoadTimeout: 100,
    threshold: 200,
    observeChanges: false,
    observeRootSelector: "body",
    mutationObserverOptions: {
      childList: true,
      subtree: true
    },
    ...userOptions
  };

  // CSS selector for all the lazy little elements.
  const selectorString = `img.${options.lazyClass},video.${options.lazyClass},iframe.${options.lazyClass},.${options.lazyBackgroundClass}`;

  // Options that get passed to requestIdleCallback
  const idleCallbackOptions = {
    timeout: options.idleLoadTimeout
  };

  // This small abstraction saves a few bytes.
  const sliceCall = arr => [].slice.call(arr);

  // This function handles the lazy loading of elements. It's kicked off by the
  // scroll handlers/intersection observers further down.
  const yallLoad = element => {
    // Lazy load <img> elements
    if (element.tagName === "IMG") {
      let parentElement = element.parentNode;

      // Is the parent element a <picture>?
      if (parentElement.tagName === "PICTURE") {
        sliceCall(parentElement.querySelectorAll("source")).forEach(source => yallFlipDataAttrs(source));
      }

      yallFlipDataAttrs(element);
    }

    // Lazy load <video> elements
    if (element.tagName === "VIDEO") {
      sliceCall(element.querySelectorAll("source")).forEach(source => yallFlipDataAttrs(source));

      // We didn't need this before, but with the addition of lazy loading
      // `poster` images, we need to run the flip attributes function on the
      // video element itself so we can trigger lazy loading behavior on those.
      yallFlipDataAttrs(element);

      if (element.autoplay === true) {
        element.load();
      }
    }

    // Lazy load <iframe> elements
    if (element.tagName === "IFRAME") {
      yallFlipDataAttrs(element);
    }

    // Lazy load CSS background images
    if (element.classList.contains(options.lazyBackgroundClass)) {
      element.classList.remove(options.lazyBackgroundClass);
      element.classList.add(options.lazyBackgroundLoaded);
    }
  };

  // Added because there was a number of patterns like this peppered throughout
  // the code. This just flips necessary data- attrs on an element
  const yallFlipDataAttrs = element => {
    // Do `srcset` first. Doing `src` first can cause loading of additional
    // assets on Safari (and possibly other webkit browsers).
    if (element.getAttribute("data-srcset") !== null) {
      element.setAttribute("srcset", element.getAttribute("data-srcset"));
    }

    if (element.getAttribute("data-src") !== null) {
      element.setAttribute("src", element.getAttribute("data-src"));
    }

    if (element.getAttribute("data-poster") !== null) {
      element.setAttribute("poster", element.getAttribute("data-poster"));
    }
  };

  // When intersection observer is unavailable, this function is bound to scroll
  // (and other) event handlers to load images the "old" way.
  const yallBack = function() {
    let active = false;

    if (active === false && lazyElements.length > 0) {
      active = true;

      setTimeout(() => {
        lazyElements.forEach(lazyElement => {
          if (lazyElement.getBoundingClientRect().top <= (window.innerHeight + options.threshold) && lazyElement.getBoundingClientRect().bottom >= -(options.threshold) && getComputedStyle(lazyElement).display !== "none") {
            if (options.idlyLoad === true && env.idleCallbackSupport === true) {
              requestIdleCallback(() => {
                yallLoad(lazyElement);
              }, idleCallbackOptions);
            } else {
              yallLoad(lazyElement);
            }

            lazyElement.classList.remove(options.lazyClass);
            lazyElements = lazyElements.filter(element => element !== lazyElement);
          }
        });

        active = false;

        if (lazyElements.length === 0 && options.observeChanges === false) {
          env.eventsToBind.forEach(eventPair => eventPair[0].removeEventListener(eventPair[1], yallBack));
        }
      }, options.throttleTime);
    }
  };

  let lazyElements = sliceCall(document.querySelectorAll(selectorString));

  if (env.intersectionObserverSupport === true) {
    var intersectionListener = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting === true || entry.intersectionRatio > 0) {
          let element = entry.target;

          if (options.idlyLoad === true && env.idleCallbackSupport === true) {
            requestIdleCallback(() => yallLoad(element), idleCallbackOptions);
          } else {
            yallLoad(element);
          }

          element.classList.remove(options.lazyClass);
          observer.unobserve(element);
          lazyElements = lazyElements.filter(lazyElement => lazyElement !== element);
        }
      });
    }, {
      rootMargin: `${options.threshold}px 0%`
    });

    lazyElements.forEach(lazyElement => intersectionListener.observe(lazyElement));
  } else {
    env.eventsToBind.forEach(eventPair => eventPair[0].addEventListener(eventPair[1], yallBack));
    yallBack();
  }

  if (env.mutationObserverSupport === true && options.observeChanges === true) {
    new MutationObserver(mutations => mutations.forEach(() => {
      sliceCall(document.querySelectorAll(selectorString)).forEach(newElement => {
        if (lazyElements.indexOf(newElement) === -1) {
          lazyElements.push(newElement);

          if (env.intersectionObserverSupport === true) {
            intersectionListener.observe(newElement);
          } else {
            yallBack();
          }
        }
      });
    })).observe(document.querySelector(options.observeRootSelector), options.mutationObserverOptions);
  }
}

export default yall;
