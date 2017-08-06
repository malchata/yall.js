/**
 * yall.js version 1.0.4
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
		sl = "slice",
		ca = "call",
		// Placeholder used for the lazy loading class**
		l = "lazy",
		// Placeholders used for "data-src" and "data-srcset" attribute references.**
		ss = "srcset",
		dss = "data-srcset",
		// Placeholders used for event handler strings.
		y = ["scroll", "touchmove"],
		z = ["orientationchange", "resize"],
		// Tracks if yall is currently processing. Used for throttling.
		a = 0,
		// A multiple event binding handler.
		b = function(obj, handlers, func, add){
			handlers[fe](function(handler){
				add ? obj.addEventListener(handler, func) : obj.removeEventListener(handler, func);
			});
		},
		// Replaces target attribute value with source attribute, if applicable
		replaceAttr = function(node, sattr, tattr){
			var v = node.getAttribute(sattr);
			if(v){
				node[tattr] = v;
				node.removeAttribute(sattr);
			}
		},
		// Lazy-loaded elements
		els,
		// The guts of the lazy loader
		yall = function(){
			if(!els.length){
				b(document, y, yall);
				b(window, z, yall);
			}

			if(!a){
				a = 1;
				setTimeout(function(){
					els[fe](function(img){
						if(img.getBoundingClientRect().top <= window.innerHeight + 100 && getComputedStyle(img).display != "none"){
							if(img[pn].tagName == "PICTURE") Array[pr][sl][ca](img[pn][qsa]("source"))[fe](function(source){
								replaceAttr(source, dss, ss)
							});
							replaceAttr(img, "data-src", "src");
							replaceAttr(img, dss, ss);
							img.classList.remove(l);
							els.splice(els.indexOf(img), 1);
						}
					});

					a = 0;
				}, 200);
			}
		};

	// Everything's kicked off on DOMContentLoaded
	b(document, ["DOMContentLoaded"], function(){
		els = Array[pr][sl][ca](document[qsa]("img."+l));

		if(els.length){
			yall();
			b(document, y, yall, 1);
			b(window, z, yall, 1);
		}
	}, 1);
})(window, document);
