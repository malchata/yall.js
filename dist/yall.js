'use strict';

function yall (options) {
  options = options || {};

  // Options
  const lazyClass = options.lazyClass || "lazy";
  const lazyBackgroundClass = options.lazyBackgroundClass || "lazy-bg";
  const idleLoadTimeout = "idleLoadTimeout" in options ? options.idleLoadTimeout : 200;
  const observeChanges = options.observeChanges || false;
  const events = options.events || {};

  // Shorthands (saves more than a few bytes!)
  const win = window;
  const ric = "requestIdleCallback";
  const io = "IntersectionObserver";

  // App stuff
  const dataAttrs = ["srcset", "src", "poster"];
  const arr = [];
  const queryDOM = (selector, root) => arr.slice.call((root || document).querySelectorAll(selector || `img.${lazyClass},video.${lazyClass},iframe.${lazyClass},.${lazyBackgroundClass}`));

  // This function handles lazy loading of elements.
  const yallLoad = element => {
    const parentNode = element.parentNode;

    if (parentNode.nodeName == "PICTURE") {
      yallApplyFn(queryDOM("source", parentNode), yallFlipDataAttrs);
    }

    if (element.nodeName == "VIDEO") {
      yallApplyFn(queryDOM("source", element), yallFlipDataAttrs);
    }
    
    yallFlipDataAttrs(element);

    if (element.autoplay) {
      element.load();
    }

    const classList = element.classList;

    // Lazy load CSS background images
    if (classList.contains(lazyBackgroundClass)) {
      classList.remove(lazyBackgroundClass);
      classList.add(options.lazyBackgroundLoaded || "lazy-bg-loaded");
    }
  };

  const yallBindEvents = element => {
    for (let eventIndex in events) {
      element.addEventListener(eventIndex, events[eventIndex].listener || events[eventIndex], events[eventIndex].options || undefined);
    }
  };

  // Added because there was a number of patterns like this peppered throughout
  // the code. This just flips necessary data- attrs on an element
  const yallFlipDataAttrs = element => {
    for (let dataAttrIndex in dataAttrs) {
      if (dataAttrs[dataAttrIndex] in element.dataset) {
        win["requestAnimationFrame"](() => {
          element.setAttribute(dataAttrs[dataAttrIndex], element.dataset[dataAttrs[dataAttrIndex]]);
        });
      }
    }
  };

  // Noticed lots of loops where a function simply gets executed on every
  // member of an array. This abstraction eliminates that repetiive code.
  const yallApplyFn = (items, fn) => {
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      fn instanceof win[io] ? fn.observe(items[itemIndex]) : fn(items[itemIndex]);
    }
  };

  const yallIntersectionObserve = entry => {
    if (entry.isIntersecting || entry.intersectionRatio) {
      const element = entry.target;

      if (ric in win && idleLoadTimeout) {
        win[ric](() => {
          yallLoad(element);
        }, {
          timeout: idleLoadTimeout
        });
      } else {
        yallLoad(element);
      }

      element.classList.remove(lazyClass);
      intersectionListener.unobserve(element);
      lazyElements = lazyElements.filter(lazyElement => lazyElement != element);

      if (!lazyElements.length && !observeChanges) {
        intersectionListener.disconnect();
      }
    }
  };

  const yallMutationObserve = newElement => {
    if (lazyElements.indexOf(newElement) < 0) {
      lazyElements.push(newElement);
      yallBindEvents(newElement);
      intersectionListener.observe(newElement);
    }
  };

  const yallCreateMutationObserver = entry => {
    new MutationObserver(() => {
      yallApplyFn(queryDOM(), yallMutationObserve);
    }).observe(entry, options.mutationObserverOptions || {
      childList: true,
      subtree: true
    });
  };

  let lazyElements = queryDOM();

  // If the current user agent is a known crawler, immediately load all media
  // for the elements yall is listening for and halt execution (good for SEO).
  if (/baidu|(?:google|bing|yandex|duckduck)bot/i.test(navigator.userAgent)) {
    yallApplyFn(lazyElements, yallLoad);

    return;
  }

  if (io in win && `${io}Entry` in win) {
    var intersectionListener = new win[io](entries => {
      yallApplyFn(entries, yallIntersectionObserve);
    }, {
      rootMargin: `${"threshold" in options ? options.threshold : 200}px 0%`
    });

    yallApplyFn(lazyElements, yallBindEvents);
    yallApplyFn(lazyElements, intersectionListener);

    if (observeChanges) {
      yallApplyFn(queryDOM(options.observeRootSelector || "body"), yallCreateMutationObserver);
    }
  }
}

module.exports = yall;
