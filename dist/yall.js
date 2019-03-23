'use strict';

function yall (options) {
  options = options || {};

  // Now that version 2 is basically sewn up, I'm using shorthands to go for the
  // gold as much as possible. I avoided this in the past to keep the codebase
  // maintainable, but with version 3 in development, I'm not as concerned.
  const io = "IntersectionObserver";
  const mo = "MutationObserver";
  const o = "observe";
  const d = document;
  const w = window;
  const fe = "forEach";
  const l = "length";
  const qsa = "querySelectorAll";
  const cl = "classList";
  const ric = "requestIdleCallback";
  const gbcr = "getBoundingClientRect";
  const el = "EventListener";
  const t = "threshold";
  const r = "remove";

  const intersectionObserverSupport = io in w && `${io}Entry` in w && "intersectionRatio" in w[`${io}Entry`].prototype && "isIntersecting" in w[`${io}Entry`].prototype;
  const idleCallbackSupport = ric in w;
  const eventsToBind = [
    [d, "scroll"],
    [d, "touchmove"],
    [w, "resize"],
    [w, "orientationchange"]
  ];
  const lazyClass = options.lazyClass || "lazy";
  const lazyBackgroundClass = options.lazyBackgroundClass || "lazy-bg";
  const idleLoadTimeout = "idleLoadTimeout" in options ? options.idleLoadTimeout : 100;
  const threshold = t in options ? options[t] : 200;
  const observeChanges = options[`${o}Changes`] || false;
  const selectorString = `img.${lazyClass},video.${lazyClass},iframe.${lazyClass},.${lazyBackgroundClass}`;
  const idleCallbackOptions = {
    timeout: idleLoadTimeout
  };
  const sliceCall = arr => [].slice.call(arr);

  // This function handles the lazy loading of elements. It's kicked off by the
  // scroll handlers/intersection observers further down.
  const yallLoad = element => {
    const parentNode = element.parentNode;
    let sourceElements;

    if (parentNode.nodeName == "PICTURE") {
      sourceElements = sliceCall(parentNode[qsa]("source"));
    }

    if (element.nodeName == "VIDEO") {
      sourceElements = sliceCall(element[qsa]("source"));
    }

    for (let sourceElementIndex in sourceElements) {
      yallFlipDataAttrs(sourceElements[sourceElementIndex]);
    }

    yallFlipDataAttrs(element);

    if (element.autoplay) {
      element.load();
    }

    // Lazy load CSS background images
    if (element[cl].contains(lazyBackgroundClass)) {
      element[cl][r](lazyBackgroundClass);
      element[cl].add(options.lazyBackgroundLoaded || "lazy-bg-loaded");
    }
  };

  // Added because there was a number of patterns like this peppered throughout
  // the code. This just flips necessary data- attrs on an element
  const yallFlipDataAttrs = element => {
    ["srcset", "src", "poster"][fe](dataAttr => {
      if (dataAttr in element.dataset) {
        element[dataAttr] = element.dataset[dataAttr];
      }
    });
  };

  // When intersection observer is unavailable, this function is bound to scroll
  // (and other) event handlers to load images the "old" way.
  const yallBack = () => {
    let active = false;

    if (!active && lazyElements[l]) {
      active = true;

      setTimeout(() => {
        lazyElements[fe](lazyElement => {
          if (lazyElement[gbcr]().top <= (innerHeight + threshold) && lazyElement[gbcr]().bottom >= -threshold && getComputedStyle(lazyElement).display != "none") {
            if (idleCallbackSupport && idleLoadTimeout) {
              w[ric](() => {
                yallLoad(lazyElement);
              }, idleCallbackOptions);
            } else {
              yallLoad(lazyElement);
            }

            lazyElement[cl][r](lazyClass);
            lazyElements = lazyElements.filter(element => element != lazyElement);
          }
        });

        active = false;

        if (!lazyElements[l] && !observeChanges) {
          for (let eventIndex in eventsToBind) {
            eventsToBind[eventIndex][0][`remove${el}`](eventsToBind[eventIndex][1], yallBack);
          }
        }
      }, "throttleTime" in options ? options.throttleTime : 200);
    }
  };

  let lazyElements = sliceCall(d[qsa](selectorString));

  // If the current user agent is a known crawler, immediately load all media
  // for the elements yall is listening for and halt execution (good for SEO).
  if (/(google|bing|yandex|duckduck)bot/i.test(navigator.userAgent)) {
    for (let lazyElementIndex in lazyElements) {
      yallLoad(lazyElements[lazyElementIndex]);
    }

    return;
  }

  if (intersectionObserverSupport) {
    var intersectionListener = new w[io]((entries, observer) => {
      entries[fe](entry => {
        if (entry.isIntersecting) {
          let element = entry.target;

          if (idleCallbackSupport && idleLoadTimeout) {
            w[ric](() => {
              yallLoad(element);
            }, idleCallbackOptions);
          } else {
            yallLoad(element);
          }

          element[cl][r](lazyClass);
          observer[`un${o}`](element);
          lazyElements = lazyElements.filter(lazyElement => lazyElement != element);

          if (!lazyElements[l] && !observeChanges) {
            intersectionListener.disconnect();
          }
        }
      });
    }, {
      rootMargin: `${threshold}px 0%`
    });

    for (let lazyElementIndex in lazyElements) {
      intersectionListener[o](lazyElements[lazyElementIndex]);
    }
  } else {
    for (let eventIndex in eventsToBind) {
      eventsToBind[eventIndex][0][`add${el}`](eventsToBind[eventIndex][1], yallBack);
    }

    yallBack();
  }

  if (mo in w && observeChanges) {
    new w[mo](() => {
      sliceCall(d[qsa](selectorString))[fe](newElement => {
        if (lazyElements.indexOf(newElement) < 0) {
          lazyElements.push(newElement);

          if (intersectionObserverSupport) {
            intersectionListener[o](newElement);
          } else {
            yallBack();
          }
        }
      });
    })[o](d.querySelector(options[`${o}RootSelector`] || "body"), options.mutationObserverOptions || {
      childList: true,
      subtree: true
    });
  }
}

module.exports = yall;
