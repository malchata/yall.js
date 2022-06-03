// App-specific
import { yallFlipDataAttrs } from "./yall-flip-data-attrs.js";

export function yallLoad (element, lazyClass, lazyBackgroundClass, lazyBackgroundLoaded) {
  if (element.nodeName == "VIDEO") {
    const sourceElements = Array.from(element.querySelectorAll("source"));

    for (const sourceElement of sourceElements) {
      yallFlipDataAttrs(sourceElement, lazyClass);
    }

    element.load();
  }

  yallFlipDataAttrs(element, lazyClass);

  const classList = element.classList;

  // Lazy load CSS background images
  if (classList.contains(lazyBackgroundClass)) {
    classList.remove(lazyBackgroundClass);
    classList.add(lazyBackgroundLoaded);
  }
}
