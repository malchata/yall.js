/**
 * yall.js version 2.0.0
 * Yet Another Lazy loader
 **/

const yallLoad = function(element, env) {
  if (element.tagName === "IMG") {
    let parentElement = element.parentNode;

    if (parentElement.tagName === "PICTURE") {
      Array.from(parentElement.querySelectorAll("source")).forEach(source => {
        for (let dataAttribute in source.dataset) {
          source.setAttribute(dataAttribute, source.dataset[dataAttribute]);
          source.removeAttribute(`data-${dataAttribute}`);
        }
      });

      for (let dataAttribute in element.dataset) {
        element.setAttribute(dataAttribute, element.dataset[dataAttribute]);
        element.removeAttribute(`data-${dataAttribute}`);
      }
    } else {
      let newImageElement = new Image();
      newImageElement.src = element.dataset.src;

      if (typeof element.dataset.srcset !== "undefined") {
        newImageElement.srcset = element.dataset.srcset;
      }

      if (env.decodeSupported === true) {
        newImageElement.decode().then(() => {
          newImageElement.alt = element.alt;
          newImageElement.width = element.width;
          newImageElement.height = element.height;
          element.replaceWith(newImageElement);
        });
      } else {
        for (let dataAttribute in element.dataset) {
          element.setAttribute(dataAttribute, element.dataset[dataAttribute]);
          element.removeAttribute(`data-${dataAttribute}`);
        }
      }
    }
  }

  if (element.tagName === "VIDEO") {
    Array.from(element.querySelectorAll("source")).forEach(source => {
      for (let dataAttribute in source.dataset) {
        source.setAttribute(dataAttribute, source.dataset[dataAttribute]);
        source.removeAttribute(`data-${dataAttribute}`);
      }
    });

    element.load();
  }

  if (element.tagName === "IFRAME") {
    element.src = element.dataset.src;
    element.removeAttribute("data-src");
  }
};

const yall = function(userOptions) {
  const env = {
    IntersectionObserverSupported: "IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype,
    mutationObserverSupported: "MutationObserver" in window,
    requestIdleCallbackSupported: "requestIdleCallback" in window,
    decodeSupported: "decode" in new Image(),
    eventsToBind: [
      [document, "scroll"],
      [document, "touchmove"],
      [window, "resize"],
      [window, "orientationchange"]
    ]
  };

  const defaultOptions = {
    lazyClass: "lazy",
    throttleTime: 200,
    idlyLoad: false,
    idleLoadTimeout: 100,
    observeChanges: false,
    observeRootSelector: "body"
  };

  const options = typeof userOptions === "object" ? Object.assign(defaultOptions, userOptions) : defaultOptions;
  const selectorString = `img.${options.lazyClass},video.${options.lazyClass},iframe.${options.lazyClass}`;

  let lazyElements = Array.from(document.querySelectorAll(selectorString));

  if (env.IntersectionObserverSupported === true) {
    var intersectionListener = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        let element = entry.target;

        if (entry.isIntersecting === true) {
          if (options.idlyLoad === true && env.requestIdleCallbackSupported === true) {
            requestIdleCallback(() => {
              yallLoad(element, env);
            }, {
              timeout: options.idleLoadTimeout
            });
          } else {
            yallLoad(element, env);
          }

          element.classList.remove(options.lazyClass);
          observer.unobserve(element);

          lazyElements = lazyElements.filter((lazyElement) => {
            return lazyElement !== element;
          });
        }
      });
    });

    lazyElements.forEach((lazyElement) => intersectionListener.observe(lazyElement));
  } else {
    const yallBack = () => {
      let active = false;

      if (active === false && lazyElements.length > 0) {
        active = true;

        setTimeout(() => {
          lazyElements.forEach((lazyElement) => {
            if (lazyElement.getBoundingClientRect().top <= window.innerHeight && lazyElement.getBoundingClientRect().bottom >= 0 && getComputedStyle(lazyElement).display !== "none") {
              if (options.idlyLoad === true && env.requestIdleCallbackSupported === true) {
                requestIdleCallback(() => {
                  yallLoad(lazyElement, env);
                }, {
                  timeout: options.idleLoadTimeout
                });
              } else {
                yallLoad(lazyElement, env);
              }

              lazyElement.classList.remove(options.lazyClass);

              lazyElements = lazyElements.filter((element) => {
                return element !== lazyElement;
              });
            }
          });

          active = false;

          if (lazyElements.length === 0 && (options.observeChanges === false)) {
            env.eventsToBind.foreach((eventPair) => eventPair[0].removeEventListener(eventPair[1], yallBack));
          }
        }, options.throttleTime);
      }
    };

    env.eventsToBind.forEach((eventPair) => eventPair[0].addEventListener(eventPair[1], yallBack));
  }

  if (env.mutationObserverSupported === true && options.observeChanges === true) {
    const mutationListener = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        Array.from(document.querySelectorAll(selectorString)).forEach((newElement) => {
          if (lazyElements.indexOf(newElement) === -1) {
            lazyElements.push(newElement);

            if (env.IntersectionObserverSupported === true) {
              intersectionListener.observe(newElement);
            }
          }
        });
      });
    });

    mutationListener.observe(options.observeRootSelector === "body" ? document.body : document.querySelector(options.observeRootSelector), {
      childList: true
    });
  }
};
