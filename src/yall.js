/**
 * yall.js version 2.0.0
 * Yet Another Lazy loader
 **/

const yallConfig = {
  env: {
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
  },
  options: {
    lazyClass: "lazy",
    throttleTime: 200,
    idlyLoad: true,
    observeChanges: false,
    observeRootSelector: "body"
  }
}

const yallLoad = (element, options) => {
  switch (element.tagName) {
    case "IMG":
      let parentElement = element.parentNode;

      if (parentElement.tagName === "PICTURE") {
        Array.from(parentElement.querySelectorAll("source")).forEach((source) => {
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

        if (options.env.decodeSupported === true) {
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
      break;

    case "VIDEO":
      Array.from(element.querySelectorAll("source")).forEach((source) => {
        for (let dataAttribute in source.dataset) {
          source.setAttribute(dataAttribute, source.dataset[dataAttribute]);
          source.removeAttribute(`data-${dataAttribute}`);
        }
      });

      element.load();
      break;

    case "IFRAME":
      element.src = element.dataset.src;
      element.removeAttribute("data-src");
      break;
  }
};

const yall = (userConfig = yallConfig) => {
  let lazyElements = Array.from(document.querySelectorAll(`img.${userConfig.options.lazyClass},video.${userConfig.options.lazyClass},iframe.${userConfig.options.lazyClass}`));

  if (userConfig.env.IntersectionObserverSupported === true) {
    let observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        let element = entry.target;

        if (entry.isIntersecting === true) {
          if (userConfig.options.idlyLoad === true && userConfig.env.requestIdleCallbackSupported === true) {
            requestIdleCallback(() => {
              yallLoad(element, userConfig);
            });
          } else {
            yallLoad(element, userConfig);
          }

          element.classList.remove(userConfig.options.lazyClass);
          observer.unobserve(element);
        }
      });
    }, {
      rootMargin: "128px 0px"
    });

    lazyElements.forEach(lazyElement => observer.observe(lazyElement));
  } else {
    const yallBack = () => {
      let active = false;

      if (active === false) {
        active = true;

        setTimeout(() => {
          lazyElements.forEach((lazyElement) => {
            if ((lazyElement.getBoundingClientRect().top <= window.innerHeight && lazyElement.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyElement).display !== "none") {
              if (userConfig.options.idlyLoad === true && userConfig.env.requestIdleCallbackSupported === true) {
                requestIdleCallback(() => {
                  yallLoad(lazyElement, userConfig);
                });
              } else {
                yallLoad(lazyElement, userConfig);
              }

              lazyElements = lazyElements.filter((element) => {
                return element !== lazyElement;
              });
            }
          });

          active = false;
        }, userConfig.options.throttleTime);
      }
    }

    userConfig.env.eventsToBind.forEach(eventPair => eventPair[0].addEventListener(eventPair[1], yallBack));
  }
};
