/**
 * yall.js version 1.1.1
 * Yet Another Lazy loader
 **/

(function(window, document){
	var
		// Placeholders used for event handler strings.
		documentEvents = ["scroll", "touchmove"],
		windowEvents = ["orientationchange", "resize"],
		// Tracks if yall is currently processing. Used for throttling. Only matters if IntersectionObserver is unsupported.
		active = 0,
		// Replaces target attribute value with source attribute, if applicable
		replaceAttr = function(node, sattr, tattr){
			var v = node.getAttribute(sattr);
			if(v){
				node[tattr] = v;
				node.removeAttribute(sattr);
			}
		},
		// The handler to load the image
		loadImage = function(img){
			if(img.parentNode.tagName == "PICTURE"){
				Array.prototype.slice.call(img.parentNode.querySelectorAll("source")).forEach(function(source){
					replaceAttr(source, "data-srcset", "srcset");
				});
			}

			replaceAttr(img, "data-src", "src");
			replaceAttr(img, "data-srcset", "srcset");
			img.classList.remove("lazy");
			elements.splice(elements.indexOf(img), 1);
		},
		// A multiple event binding handler.
		multiBind = function(obj, handlers, fn, remove){
			handlers.forEach(function(handler){
				remove ? obj.removeEventListener(handler, fn) : obj.addEventListener(handler, fn);
			});
		},
		// The guts of the lazy loader (now only used when IntersectionObserver is not supported)
		yall = function(){
			if(!elements.length){
				multiBind(document, documentEvents, yall, 1);
				multiBind(window, windowEvents, yall, 1);
			}

			if(!active){
				active = 1;

				setTimeout(function(){
					elements.forEach(function(img){
						if((img.getBoundingClientRect().top <= window.innerHeight && img.getBoundingClientRect().bottom >= 0) && getComputedStyle(img).display != "none"){
							loadImage(img);
						}
					});

					active = 0;
				}, 200);
			}
		};

	// Everything's kicked off on DOMContentLoaded
	multiBind(document, ["DOMContentLoaded"], function(){
		elements = Array.prototype.slice.call(document.querySelectorAll("img.lazy"));

		if(elements.length){
			// This compatibility check has been taken from https://github.com/WICG/IntersectionObserver/blob/gh-pages/polyfill/intersection-observer.js
			if("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in IntersectionObserverEntry.prototype){
				ob = new IntersectionObserver(function(entries, observer){
					entries.forEach(function(entry){
						if(entry.isIntersecting){
							loadImage(entry.target);
							if(!elements.length) observer.disconnect();
						}
					});
				});

				elements.forEach(function(img){
					ob.observe(img);
				});

				return;
			}

			// If IntersectionObserver isn't available, we'll do things the old way.
			yall();
			multiBind(document, documentEvents, yall);
			multiBind(window, windowEvents, yall);
		}
	});
})(window, document);
