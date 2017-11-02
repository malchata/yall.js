/**
 * yall.js version 1.2.0
 * Yet Another Lazy loader
 **/

(function(window, document){
	var
		// The primary goal here is to keep this script as small as possible
		// while maintaining functionality. The uglifier goes a long way,
		// but we can take things a bit farther by saving references for
		// frequently used method and strings.
		fe = "forEach",
		qsa = "querySelectorAll",
		pn = "parentNode",
		gbcr = "getBoundingClientRect",
		pr = "prototype",
		io = "IntersectionObserver",
		ioe = io + "Entry",
		s = "src",
		ss = "srcset",
		d = "data-",
		ds = d + s,
		dss = d + ss,
		// Placeholders used for event handler strings.
		documentEvents = ["scroll", "touchmove"],
		windowEvents = ["orientationchange", "resize"],
		// Tracks if yall is currently processing. Used for throttling. Only relevant if IntersectionObserver is unsupported.
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
		// The handler to load the media
		loadMedia = function(media){
			if(media.tagName == "VIDEO"){
				Array[pr].slice.call(media[qsa]("source"))[fe](function(source){
					replaceAttr(source, ds, s);
				});

				media.load();
			}
			else{
				if(media[pn].tagName == "PICTURE"){
					Array[pr].slice.call(media[pn][qsa]("source"))[fe](function(source){
						replaceAttr(source, dss, ss);
					});
				}

				replaceAttr(media, ds, s);
				replaceAttr(media, dss, ss);
			}

			media.classList.remove("lazy");

			elements = elements.filter(function(e){
				return e !== media;
			});
		},
		// A multiple event binding handler.
		multiBind = function(obj, handlers, fn, remove){
			handlers[fe](function(handler){
				remove ? obj.removeEventListener(handler, fn) : obj.addEventListener(handler, fn);
			});
		},
		// The guts of the lazy loader (now only used when IntersectionObserver is not supported)
		yall = function(){
			if(!elements.length){
				// There are no more elements to lazy load, so we'll unbind everything.
				multiBind(document, documentEvents, yall, 1);
				multiBind(window, windowEvents, yall, 1);
			}

			// Check if the lazy loader is active
			if(!active){
				active = 1;

				setTimeout(function(){
					elements[fe](function(media){
						if((media[gbcr]().top <= window.innerHeight && media[gbcr]().bottom >= 0) && getComputedStyle(media).display != "none"){
							loadMedia(media);
						}
					});

					active = 0;
				}, 200);
			}
		};

	// Everything's kicked off on DOMContentLoaded
	multiBind(document, ["DOMContentLoaded"], function(){
		elements = Array[pr].slice.call(document[qsa](".lazy"));

		// We're only going to do stuff if we found `.lazy` elements
		if(elements.length){
			// This compatibility check has been taken from https://github.com/WICG/IntersectionObserver/blob/gh-pages/polyfill/intersection-observer.js
			if(io in window && ioe in window && "intersectionRatio" in window[ioe][pr]){
				var mediaObserver = new window[io](function(entries, observer){
					entries[fe](function(entry){
						if(entry.isIntersecting){
							loadMedia(entry.target);
							mediaObserver.unobserve(entry.target);
						}
					});
				});

				elements[fe](function(media){
					mediaObserver.observe(media);
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
