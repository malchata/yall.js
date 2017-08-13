/**
 * yall.js version 1.1.1
 * Yet Another Lazy loader
 **/

(function(window, document){
	var
		// The primary goal here is to keep this script as small as possible
		// while maintaining functionality. The uglifier goes a long way,
		// but we can take things a bit farther by saving strings for
		// frequently used method and strings.
		fe = "forEach",
		qsa = "querySelectorAll",
		pn = "parentNode",
		gbcr = "getBoundingClientRect",
		pr = "prototype",
		io = "IntersectionObserver",
		ioe = io + "Entry",
		ln = "length",
		dss = "data-srcset",
		// Placeholders used for event handler strings.
		documentEvents = ["scroll", "touchmove"],
		windowEvents = ["orientationchange", "resize"],
		// Tracks if yall is currently processing. Used for throttling. Only matters if IntersectionObserver is unsupported.
		active = 0,
		// Placeholder for elements
		elements,
		// Replaces target attribute value with source attribute, if applicable
		replaceAttr = function(node, sourceAttr, targetAttr){
			var v = node.getAttribute(sourceAttr);

			if(v){
				node[targetAttr] = v;
				node.removeAttribute(sourceAttr);
			}
		},
		// The handler to load the image
		loadImage = function(img){
			if(img[pn].tagName == "PICTURE"){
				Array[pr].slice.call(img[pn][qsa]("source"))[fe](function(source){
					replaceAttr(source, dss, "srcset");
				});
			}

			replaceAttr(img, "data-src", "src");
			replaceAttr(img, dss, "srcset");
			img.classList.remove("lazy");
			elements.splice(elements.indexOf(img), 1);
		},
		// A multiple event binding handler.
		multiBind = function(obj, handlers, fn, remove){
			handlers[fe](function(handler){
				remove ? obj.removeEventListener(handler, fn) : obj.addEventListener(handler, fn);
			});
		},
		// The guts of the lazy loader (now only used when IntersectionObserver is not supported)
		yall = function(){
			if(!elements[ln]){
				// There are no more elements to lazy load, so we'll unbind everything.
				multiBind(document, documentEvents, yall, 1);
				multiBind(window, windowEvents, yall, 1);
			}

			// Check if the lazy loader is active
			if(!active){
				active = 1;

				setTimeout(function(){
					elements[fe](function(img){
						if((img[gbcr]().top <= window.innerHeight && img[gbcr]().bottom >= 0) && getComputedStyle(img).display != "none"){
							loadImage(img);
						}
					});

					active = 0;
				}, 200);
			}
		};

	// Everything's kicked off on DOMContentLoaded
	multiBind(document, ["DOMContentLoaded"], function(){
		elements = Array[pr].slice.call(document[qsa]("img.lazy"));

		// We're only going to do stuff if we found `img.lazy` elements
		if(elements[ln]){
			// This compatibility check has been taken from https://github.com/WICG/IntersectionObserver/blob/gh-pages/polyfill/intersection-observer.js
			if(io in window && ioe in window && "intersectionRatio" in window[ioe][pr]){
				var imageObserver = new window[io](function(entries, observer){
					entries[fe](function(entry){
						if(entry.isIntersecting){
							loadImage(entry.target);

							if(!elements[ln]){
								observer.disconnect();
							}
						}
					});
				});

				elements[fe](function(img){
					imageObserver.observe(img);
				});
			}
			else{
				// If IntersectionObserver isn't available, we'll do things the old way.
				yall();
				multiBind(document, documentEvents, yall);
				multiBind(window, windowEvents, yall);
			}
		}
	});
})(window, document);
