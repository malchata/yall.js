// App-specific
import { yallBindEvents } from "./lib/yall-bind-events.js";
import { yallLoad } from "./lib/yall-load.js";
import { INTERSECTION_OBSERVER_SUPPORTED, CRAWLER } from "./lib/constants.js";

export function yall (options) {
  const lazyClass = options?.lazyClass || "lazy";
  const lazyBackgroundClass = options?.lazyBackgroundClass || "lazy-bg";
  const lazyBackgroundLoaded = options?.lazyBackgroundLoaded || "lazy-bg-loaded";
  const threshold = options?.threshold || 200;
  const events = options?.events || {};
  const observeChanges = options?.observeChanges || false;
  const observeRootSelector = options?.observeRootSelector || "body";
  const mutationObserverOptions = options?.mutationObserverOptions || {
    childList: true,
    subtree: true
  };
  const lazySelector = `video.${lazyClass},.${lazyBackgroundClass}`;
  let lazyElements = Array.from(document.querySelectorAll(lazySelector));

  for (const lazyElement of lazyElements) {
    yallBindEvents(lazyElement, events);
  }

  // First we check if IntersectionObserver is supported. If the
  // current user agent is a known crawler we just load everything.
  if (INTERSECTION_OBSERVER_SUPPORTED === true && CRAWLER === false) {
    var intersectionListener = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting || entry.intersectionRatio) {
          const { target } = entry;

          yallLoad(target, lazyClass, lazyBackgroundClass, lazyBackgroundLoaded);

          intersectionListener.unobserve(target);
          lazyElements = lazyElements.filter(lazyElement => lazyElement != target);

          // If all the elements that were detected at load time are all loaded
          // and we're not observing for changes, we're all done here.
          if (lazyElements.length === 0 && observeChanges === false) {
            intersectionListener.disconnect();
          }
        }
      }
    }, {
      rootMargin: `${threshold}px 0%`
    });

    for (const lazyElement of lazyElements) {
      intersectionListener.observe(lazyElement);
    }

    if (observeChanges) {
      new MutationObserver(() => {
        const newElements = document.querySelectorAll(lazySelector);

        for (const newElement of newElements) {
          if (lazyElements.includes(newElement) === false) {
            lazyElements.push(newElement);
            yallBindEvents(newElement, events);

            if (INTERSECTION_OBSERVER_SUPPORTED === true && CRAWLER === false) {
              intersectionListener.observe(newElement);
            }
          }
        }
      }).observe(document.querySelector(observeRootSelector), mutationObserverOptions);
    }
  } else if (CRAWLER) {
    for (const lazyElement of lazyElements) {
      yallLoad(lazyElement, lazyClass, lazyBackgroundClass, lazyBackgroundLoaded);
    }
  }
}
