export default function (options) {
  if (!options) {
    options = {};
  }

  const intersectionObserverSupport = "IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype;
  const idleCallbackSupport = "requestIdleCallback" in window;
  const eventsToBind = [
    [document, "scroll"],
    [document, "touchmove"],
    [window, "resize"],
    [window, "orientationchange"]
  ];
  const lazyClass = options.lazyClass || "lazy";
  const lazyBackgroundClass = options.lazyBackgroundClass || "lazy-bg";
  const idleLoadTimeout = options.idleLoadTimeout || 100;
  const threshold = options.threshold || 200;
  const observeChanges = options.observeChanges || false;
  const selectorString = `img.${lazyClass},video.${lazyClass},iframe.${lazyClass},.${lazyBackgroundClass}`;
  const dataAttrs = ["srcset", "src", "poster"];
  const idleCallbackOptions = {
    timeout: idleLoadTimeout
  };
  const sliceCall = arr => [].slice.call(arr);

  // This function handles the lazy loading of elements. It's kicked off by the
  // scroll handlers/intersection observers further down.
  const yallLoad = element => {
    switch (element.nodeName) {
      case "IMG":
        let parentElement = element.parentNode;

        // Is the parent element a <picture>?
        if (parentElement.nodeName == "PICTURE") {
          sliceCall(parentElement.querySelectorAll("source")).forEach(source => {
            yallFlipDataAttrs(source);
          });
        }

        yallFlipDataAttrs(element);

        break;

      case "VIDEO":
        sliceCall(element.querySelectorAll("source")).forEach(source => {
          yallFlipDataAttrs(source);
        });

        // We didn't need this before, but with the addition of lazy loading
        // `poster` images, we need to run the flip attributes function on the
        // video element itself so we can trigger lazy loading behavior on those.
        yallFlipDataAttrs(element);

        if (element.autoplay) {
          element.load();
        }

        break;

      case "IFRAME":
        yallFlipDataAttrs(element);

        break;
    }

    // Lazy load CSS background images
    if (element.classList.contains(lazyBackgroundClass)) {
      element.classList.remove(lazyBackgroundClass);
      element.classList.add(options.lazyBackgroundLoaded || "lazy-bg-loaded");
    }
  };

  // Added because there was a number of patterns like this peppered throughout
  // the code. This just flips necessary data- attrs on an element
  const yallFlipDataAttrs = element => {
    dataAttrs.forEach(dataAttr => {
      if (dataAttr in element.dataset) {
        element[dataAttr] = element.dataset[dataAttr];
      }
    });
  };

  // When intersection observer is unavailable, this function is bound to scroll
  // (and other) event handlers to load images the "old" way.
  const yallBack = () => {
    let active = false;

    if (!active && lazyElements.length) {
      active = true;

      setTimeout(() => {
        lazyElements.forEach(lazyElement => {
          if (lazyElement.getBoundingClientRect().top <= (window.innerHeight + threshold) && lazyElement.getBoundingClientRect().bottom >= -threshold && getComputedStyle(lazyElement).display != "none") {
            if (idleCallbackSupport && idleLoadTimeout) {
              requestIdleCallback(() => {
                yallLoad(lazyElement);
              }, idleCallbackOptions);
            } else {
              yallLoad(lazyElement);
            }

            lazyElement.classList.remove(lazyClass);
            lazyElements = lazyElements.filter(element => element != lazyElement);
          }
        });

        active = false;

        if (!lazyElements.length && !observeChanges) {
          eventsToBind.forEach(eventPair => {
            eventPair[0].removeEventListener(eventPair[1], yallBack);
          });
        }
      }, options.throttleTime || 200);
    }
  };

  let lazyElements = sliceCall(document.querySelectorAll(selectorString));

  // If the current user agent is a known crawler, immediately load all media
  // for the elements yall is listening for and halt execution (good for SEO).
  if (/(google|bing|yandex|duckduck)bot/i.test(navigator.userAgent)) {
    lazyElements.forEach(lazyElement => {
      yallLoad(lazyElement);
    });

    return;
  }

  if (intersectionObserverSupport) {
    var intersectionListener = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          let element = entry.target;

          if (idleCallbackSupport && idleLoadTimeout) {
            requestIdleCallback(() => {
              yallLoad(element);
            }, idleCallbackOptions);
          } else {
            yallLoad(element);
          }

          element.classList.remove(lazyClass);
          observer.unobserve(element);
          lazyElements = lazyElements.filter(lazyElement => lazyElement != element);
        }
      });
    }, {
      rootMargin: `${threshold}px 0%`
    });

    lazyElements.forEach(lazyElement => {
      intersectionListener.observe(lazyElement);
    });
  } else {
    eventsToBind.forEach(eventPair => {
      eventPair[0].addEventListener(eventPair[1], yallBack);
    });

    yallBack();
  }

  if ("MutationObserver" in window && observeChanges) {
    new MutationObserver(mutations => {
      mutations.forEach(() => {
        sliceCall(document.querySelectorAll(selectorString)).forEach(newElement => {
          if (lazyElements.indexOf(newElement) == -1) {
            lazyElements.push(newElement);

            if (intersectionObserverSupport) {
              intersectionListener.observe(newElement);
            } else {
              yallBack();
            }
          }
        });
      });
    }).observe(document.querySelector(options.observeRootSelector || "body"), options.mutationObserverOptions || {
      childList: true,
      subtree: true
    });
  }
}
