export const INTERSECTION_OBSERVER_SUPPORTED = "IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype;
export const CRAWLER = /baidu|(?:google|bing|yandex|duckduck)bot/i.test(navigator.userAgent);
export const DATA_ATTRS = ["src", "poster"];
