// App-specific
import { DATA_ATTRS } from "./constants.js";

export function yallFlipDataAttrs (element, lazyClass) {
  for (const dataAttr of DATA_ATTRS) {
    if (dataAttr in element.dataset) {
      element.setAttribute(dataAttr, element.dataset[dataAttr]);

      if (element.classList.contains(lazyClass)) {
        element.classList.remove(lazyClass);
      }
    }
  }
}
