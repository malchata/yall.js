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
		sa = "setAttribute",
		ga = "getAttribute",
		ra = "removeAttribute",
		ael = "addEventListener",
		rel = "removeEventListener",
		cl = "classList",
		fe = "forEach",
		st = "scrollTop",
		// Placeholder used for the lazy loading class**
		l = "lazy",
		// Placeholders used for "data-src" and "data-srcset" attribute references.**
		ss = "srcset",
		ds = "data-src",
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
				add ? obj[ael](handler, func) : obj[rel](handler, func);
			});
		},
		// Replaces target attribute value with source attribute, if applicable
		replaceAttr = (node, sattr, tattr)=>{
			let v = node[ga](sattr);
			v ? (node[tattr] = v, node[ra](sattr)) : 0;
		},
		// Lazy-loaded elements
		els,
		// The guts of the lazy loader
		yall = ()=>{
			!els.length ? (b(document, y, yall), b(window, z, yall)) : 0;

			if(!a){
				a++;
				setTimeout(()=>{
					els[fe]((img)=>{
						if(img[cl].contains(l) && img.getBoundingClientRect().top <= window.innerHeight + 100 && getComputedStyle(img).display != "none"){
							img[pn].tagName == "PICTURE" ? [].slice.call(img[pn][qsa]("source"))[fe]((source)=>replaceAttr(source, dss, ss)) : 0;
							replaceAttr(img, ds, "src");
							replaceAttr(img, dss, ss);
							img[cl].remove(l);
						}
					});

					a--;
				}, 200);
			}
		};

	// Everything's kicked off on DOMContentLoaded
	b(document, ["DOMContentLoaded"], ()=>{
		els = [].slice.call(document[qsa]("."+l));
		yall();
		b(document, y, yall, 1);
		b(window, z, yall, 1);
	}, 1);
})(window, document);
