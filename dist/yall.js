'use strict';

function yall (options) {
  options = options || {};

  // Options
  const lazyClass = options.lazyClass || "lazy";
  const lazyBackgroundClass = options.lazyBackgroundClass || "lazy-bg";
  const idleLoadTimeout = "idleLoadTimeout" in options ? options.idleLoadTimeout : 200;
  const observeChanges = options.observeChanges || false;
  const events = options.events || {};
  const noPolyfill = options.noPolyfill || false;

  // Shorthands (saves more than a few bytes!)
  const win = window;
  const ric = "requestIdleCallback";
  const io = "IntersectionObserver";
  const ioSupport = io in win && `${io}Entry` in win;

  // App stuff
  const crawler = /baidu|(?:google|bing|yandex|duckduck)bot/i.test(navigator.userAgent);
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
  // the code. This flips necessary data- attrs on an element and prompts video
  // elements to begin playback automatically if they have autoplay specified.
  const yallFlipDataAttrs = element => {
    for (let dataAttrIndex in dataAttrs) {
      if (dataAttrs[dataAttrIndex] in element.dataset) {
        element.setAttribute(dataAttrs[dataAttrIndex], element.dataset[dataAttrs[dataAttrIndex]]);
        const parentNode = element.parentNode;

        if (element.nodeName === "SOURCE" && parentNode.autoplay) {
          parentNode.load();

          // For some reason, IE11 needs to have this method invoked in order
          // for autoplay to start. So we do a yucky user agent check.
          if (/Trident/.test(navigator.userAgent)) {
            parentNode.play();
          }

          parentNode.classList.remove(lazyClass);
        }

        element.classList.remove(lazyClass);
      }
    }
  };

  // Noticed lots of loops where a function simply gets executed on every
  // member of an array. This abstraction eliminates that repetitive code.
  const yallApplyFn = (items, fn) => {
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      win[io] && fn instanceof win[io] ? fn.observe(items[itemIndex]) : fn(items[itemIndex]);
    }
  };

  const yallCreateMutationObserver = entry => {
    new MutationObserver(() => {
      yallApplyFn(queryDOM(), newElement => {
        if (lazyElements.indexOf(newElement) < 0) {
          lazyElements.push(newElement);
          yallBindEvents(newElement);

          if (ioSupport && !crawler) {
            intersectionListener.observe(newElement);
          } else if (noPolyfill || crawler) {
            yallApplyFn(lazyElements, yallLoad);
          }
        }
      });
    }).observe(entry, options.mutationObserverOptions || {
      childList: true,
      subtree: true
    });
  };

  let lazyElements = queryDOM();

  yallApplyFn(lazyElements, yallBindEvents);

  // First we check if IntersectionObserver is supported. If not, we check to
  // see if the `noPolyfill` option is set. If so, we load everything. If the
  // current user agent is a known crawler, again, we load everything.
  if (ioSupport && !crawler) {
    var intersectionListener = new win[io](entries => {
      yallApplyFn(entries, entry => {
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

          intersectionListener.unobserve(element);
          lazyElements = lazyElements.filter(lazyElement => lazyElement != element);

          // If all the elements that were detected at load time are all loaded
          // and we're not observing for changes, we're all done here.
          if (!lazyElements.length && !observeChanges) {
            intersectionListener.disconnect();
          }
        }
      });
    }, {
      rootMargin: `${"threshold" in options ? options.threshold : 200}px 0%`
    });

    yallApplyFn(lazyElements, intersectionListener);

    if (observeChanges) {
      yallApplyFn(queryDOM(options.observeRootSelector || "body"), yallCreateMutationObserver);
    }
  } else if (noPolyfill || crawler) {
    yallApplyFn(lazyElements, yallLoad);
  }
}

module.exports = yall;
