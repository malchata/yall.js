/**
 * yall.js version 1.1.0
 * Yet Another Lazy loader
 * This library is intended to be very small. As such, some of may not be very readable.
 * I don't normally code like this, but I wanted to see just how small I could get it!
 **/

(function(window, document){
	/**
	 * Everything below is defined in such a way to reduce
	 * uglifier output. If a method or string is only used once, it
	 * will be invoked normally. Otherwise, method shorthands are used.
	 **/

	var
		// Placeholders used for common method names.
		qsa = "querySelectorAll",
		fe = "forEach",
		pn = "parentNode",
		pr = "prototype",
		gbcr = "getBoundingClientRect",
		io = "IntersectionObserver",
		// Placeholders used for "data-src" and "data-srcset" attribute references.
		dss = "data-srcset",
		// Placeholders used for event handler strings.
		y = ["scroll", "touchmove"],
		z = ["orientationchange", "resize"],
		// The handler to load the image
		l = function(img){
			if(img[pn].tagName == "PICTURE"){
				Array[pr].slice.call(img[pn][qsa]("source"))[fe](function(source){
					ra(source, dss, "srcset");
				});
			}

			ra(img, "data-src", "src");
			ra(img, dss, "srcset");
			img.classList.remove("lazy");
			els.splice(els.indexOf(img), 1);
		},
		// Tracks if yall is currently processing. Used for throttling. Only matters if IntersectionObserver is unsupported.
		a = 0,
		// A multiple event binding handler.
		b = function(obj, handlers, fn, add){
			handlers[fe](function(handler){
				add ? obj.addEventListener(handler, fn) : obj.removeEventListener(handler, fn);
			});
		},
		// Replaces target attribute value with source attribute, if applicable
		ra = function(node, sattr, tattr){
			var v = node.getAttribute(sattr);
			if(v){
				node[tattr] = v;
				node.removeAttribute(sattr);
			}
		},
		// The guts of the lazy loader (now only used when IntersectionObserver is not supported)
		ll = function(){
			if(!els.length) (b(document, y, ll), b(window, z, ll));

			if(!a){
				a = 1;
				setTimeout(function(){
					els[fe](function(img){
						if((img[gbcr]().top <= window.innerHeight && img[gbcr]().bottom >= 0) && getComputedStyle(img).display != "none") l(img);
					});

					a = 0;
				}, 200);
			}
		};

	// Everything's kicked off on DOMContentLoaded
	b(document, ["DOMContentLoaded"], function(){
		els = Array[pr].slice.call(document[qsa]("img.lazy"));

		if(els.length){
			if(io in window && io+"Entry" in window && "intersectionRatio" in window[io+"Entry"][pr]){
				els[fe](function(img){
					new window[io](function(entries, observer){
						entries[fe](function(entry){
							if(entry.isIntersecting){
								l(img);
								observer.disconnect();
							}
						});
					}).observe(img);
				});

				return;
			}

			ll();
			b(document, y, ll, 1);
			b(window, z, ll, 1);
		}
	}, 1);
})(window, document);
