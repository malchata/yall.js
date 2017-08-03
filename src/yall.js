/**
 * yall.js
 * Yet Another Lazy loader
 * This library is intended to be very small. As such, some of it is not going to be easily readable.
 * I don't normally code like this, but I wanted to see just how small I could get this library.
 * There may yet be a pattern out there that can yield a smaller library than this.
 **/

((window, document)=>{
	/**
	 * Anything suffixed with a double asterisk (**)
	 * indicates that it was defined solely to shave
	 * bytes from the final build.
	 **/

	let
		// Placeholders used for common method names.**
		qsa = "querySelectorAll",
		fe = "forEach",
		// Placeholder used for the lazy loading class**
		l = "lazy",
		// Placeholders used for "data-src" and "data-srcset" attribute references.**
		ss = "srcset",
		dss = "data-srcset",
		pn = "parentNode",
		// Placeholders used for event handler strings.**
		y = ["scroll", "touchmove"],
		z = ["orientationchange", "resize"],
		// Tracks if yall is working. Used for throttling.
		a = 0,
		// A multiple event binding handler.**
		b = (obj, handlers, func, add)=>{
			handlers[fe]((handler)=>{
				add ? obj.addEventListener(handler, func) : obj.removeEventListener(handler, func);
			});
		},
		// Replaces target attribute value with source attribute, if applicable
		replaceAttr = (node, sattr, tattr)=>{
			let v = node.getAttribute(sattr);
			if(v) (node[tattr] = v, node.removeAttribute(sattr));
		},
		// Lazy-loaded elements
		els,
		// The guts of the lazy loader
		yall = ()=>{
			if(!els.length) (b(document, y, yall), b(window, z, yall));

			if(!a){
				a = 1;
				setTimeout(()=>{
					els[fe]((img)=>{
						if(img.getBoundingClientRect().top <= window.innerHeight + 100 && getComputedStyle(img).display != "none"){
							if(img[pn].tagName == "PICTURE") [].slice.call(img[pn][qsa]("source"))[fe]((source)=>replaceAttr(source, dss, ss));
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
	b(document, ["DOMContentLoaded"], ()=>{
		els = [].slice.call(document[qsa](`.${l}`));
		yall();
		b(document, y, yall, 1);
		b(window, z, yall, 1);
	}, 1);
})(window, document);
