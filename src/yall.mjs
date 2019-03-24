export default function (options) {
  options = options || {};

  const lazyClass = options.lazyClass || "lazy";
  const lazyBackgroundClass = options.lazyBackgroundClass || "lazy-bg";
  const idleLoadTimeout = "idleLoadTimeout" in options ? options.idleLoadTimeout : 200;
  const observeChanges = options.observeChanges || false;
  const selectorString = `img.${lazyClass},video.${lazyClass},iframe.${lazyClass},.${lazyBackgroundClass}`;
  const events = options.events || {};

  // This abstraction shaves off a few bytes (plus it's nifty).
  const nodeListToArray = nodeList => [].slice.call(nodeList);

  // This function handles lazy loading of elements.
  const yallLoad = element => {
    const parentNode = element.parentNode;
    let sourceElements;

    if (parentNode.nodeName == "PICTURE") {
      sourceElements = nodeListToArray(parentNode.querySelectorAll("source"));
    }

    if (element.nodeName == "VIDEO") {
      sourceElements = nodeListToArray(element.querySelectorAll("source"));
    }

    for (let sourceElementIndex in sourceElements) {
      yallFlipDataAttrs(sourceElements[sourceElementIndex]);
    }

    yallFlipDataAttrs(element);

    if (element.autoplay) {
      element.load();
    }

    // Lazy load CSS background images
    if (element.classList.contains(lazyBackgroundClass)) {
      element.classList.remove(lazyBackgroundClass);
      element.classList.add(options.lazyBackgroundLoaded || "lazy-bg-loaded");
    }
  };

  const yallBind = (intersectionListener, element) => {
    intersectionListener.observe(element);

    Object.keys(events).forEach(eventKey => {
      element.addEventListener(eventKey, events[eventKey].listener || events[eventKey], events[eventKey].options || undefined);
    });
  };

  // Added because there was a number of patterns like this peppered throughout
  // the code. This just flips necessary data- attrs on an element
  const yallFlipDataAttrs = element => {
    ["srcset", "src", "poster"].forEach(dataAttr => {
      if (dataAttr in element.dataset) {
        element[dataAttr] = element.dataset[dataAttr];
      }
    });
  };

  let lazyElements = nodeListToArray(document.querySelectorAll(selectorString));

  // If the current user agent is a known crawler, immediately load all media
  // for the elements yall is listening for and halt execution (good for SEO).
  if (/(google|bing|yandex|duckduck)bot/i.test(navigator.userAgent)) {
    for (let lazyElementIndex in lazyElements) {
      yallLoad(lazyElements[lazyElementIndex]);
    }

    return;
  }

  if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window) {
    var intersectionListener = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;

          if ("requestIdleCallback" in window && idleLoadTimeout) {
            requestIdleCallback(() => {
              yallLoad(element);
            }, {
              timeout: idleLoadTimeout
            });
          } else {
            yallLoad(element);
          }

          element.classList.remove(lazyClass);
          observer.unobserve(element);
          lazyElements = lazyElements.filter(lazyElement => lazyElement != element);

          if (!lazyElements.length && !observeChanges) {
            intersectionListener.disconnect();
          }
        }
      });
    }, {
      rootMargin: `${"threshold" in options ? options.threshold : 200}px 0%`
    });

    for (let lazyElementIndex in lazyElements) {
      yallBind(intersectionListener, lazyElements[lazyElementIndex]);
    }

    if ("MutationObserver" in window && observeChanges) {
      new MutationObserver(() => {
        nodeListToArray(document.querySelectorAll(selectorString)).forEach(newElement => {
          if (lazyElements.indexOf(newElement) < 0) {
            lazyElements.push(newElement);
            yallBind(intersectionListener, newElement);
          }
        });
      }).observe(document.querySelector(options.observeRootSelector || "body"), options.mutationObserverOptions || {
        childList: true,
        subtree: true
      });
    }
  }
}
