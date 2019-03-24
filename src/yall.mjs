export default function (options) {
  if (!options) {
    options = {};
  }

  const doc = document;
  const win = window;
  const arr = [];
  const qsa = (root, sel) => arr.slice.call(root.querySelectorAll(sel));

  const intersectionObserverSupport = "IntersectionObserver" in win && "IntersectionObserverEntry" in win;
  const lazyClass = options.lazyClass || "lazy";
  const lazyBackgroundClass = options.lazyBackgroundClass || "lazy-bg";
  const idleLoadTimeout = "idleLoadTimeout" in options ? options.idleLoadTimeout : 100;
  const observeChanges = options.observeChanges || false;
  const selectorString = `img.${lazyClass},video.${lazyClass},iframe.${lazyClass},.${lazyBackgroundClass}`;

  const dataAttrs = ["srcset", "src", "poster"];

  // This function handles lazy loading of elements.
  const yallLoad = element => {
    const parentNode = element.parentNode;
    let sourceElements;

    if (parentNode.nodeName == "PICTURE") {
      sourceElements = qsa(parentNode, "source");
    }

    if (element.nodeName == "VIDEO") {
      sourceElements = qsa(element, "source");
    }

    for (let sourceElementIndex in sourceElements) {
      yallFlipDataAttrs(sourceElements[sourceElementIndex]);
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

  // Added because there was a number of patterns like this peppered throughout
  // the code. This just flips necessary data- attrs on an element
  const yallFlipDataAttrs = element => {
    dataAttrs.forEach(dataAttr => {
      if (dataAttr in element.dataset) {
        element[dataAttr] = element.dataset[dataAttr];
      }
    });
  };

  let lazyElements = qsa(doc, selectorString);

  // If the current user agent is a known crawler, immediately load all media
  // for the elements yall is listening for and halt execution (good for SEO).
  if (/baidu|(?:google|bing|yandex|duckduck)bot/i.test(navigator.userAgent)) {
    for (let lazyElementIndex in lazyElements) {
      yallLoad(lazyElements[lazyElementIndex]);
    }

    return;
  }

  if (intersectionObserverSupport) {
    var intersectionListener = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;

          if ("requestIdleCallback" in win && idleLoadTimeout) {
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
      intersectionListener.observe(lazyElements[lazyElementIndex]);
    }
  }

  if ("MutationObserver" in win && observeChanges) {
    new MutationObserver(() => {
      qsa(doc, selectorString).forEach(newElement => {
        if (lazyElements.indexOf(newElement) < 0 && intersectionObserverSupport) {
          lazyElements.push(newElement);
          intersectionListener.observe(newElement);
        }
      });
    }).observe(qsa(doc, options.observeRootSelector || "body")[0], options.mutationObserverOptions || {
      childList: true,
      subtree: true
    });
  }
}
