export default function (options) {
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
    let elements = [];
    let sourceNode;

    if (parentNode.nodeName == "PICTURE") {
      sourceNode = parentNode;
    }

    if (element.nodeName == "VIDEO") {
      sourceNode = element;
    }

    elements = queryDOM("source", sourceNode);

    for (let elementIndex in elements) {
      yallFlipDataAttrs(elements[elementIndex]);
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

  const yallBind = element => {
    for (let eventIndex in events) {
      element.addEventListener(eventIndex, events[eventIndex].listener || events[eventIndex], events[eventIndex].options || undefined);
    }

    intersectionListener.observe(element);
  };

  // Added because there was a number of patterns like this peppered throughout
  // the code. This just flips necessary data- attrs on an element
  const yallFlipDataAttrs = element => {
    dataAttrs.forEach(dataAttr => {
      if (dataAttr in element.dataset) {
        win["requestAnimationFrame"](() => {
          element[dataAttr] = element.dataset[dataAttr];
        });
      }
    });
  };

  let lazyElements = queryDOM();

  // If the current user agent is a known crawler, immediately load all media
  // for the elements yall is listening for and halt execution (good for SEO).
  if (/baidu|(?:google|bing|yandex|duckduck)bot/i.test(navigator.userAgent)) {
    for (let lazyElementIndex in lazyElements) {
      yallLoad(lazyElements[lazyElementIndex]);
    }

    return;
  }

  if (io in win && `${io}Entry` in win) {
    var intersectionListener = new win[io]((entries, observer) => {
      entries.forEach(entry => {
        if (entry.intersectionRatio) {
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
      yallBind(lazyElements[lazyElementIndex]);
    }

    if (observeChanges) {
      new MutationObserver(() => {
        queryDOM().forEach(newElement => {
          if (lazyElements.indexOf(newElement) < 0) {
            lazyElements.push(newElement);
            yallBind(newElement);
          }
        });
      }).observe(queryDOM(options.observeRootSelector || "body")[0], options.mutationObserverOptions || {
        childList: true,
        subtree: true
      });
    }
  }
}
