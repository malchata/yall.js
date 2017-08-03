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

	const
		// Placeholders used for common method names.**
		qsa = "querySelectorAll",
		sa = "setAttribute",
		ga = "getAttribute",
		ra = "removeAttribute",
		ael = "addEventListener",
		rel = "removeEventListener",
		cl = "classList",
		fe = "forEach",
		// Placeholder used for the lazy loading class**
		l = "lazy",
		// Placeholders used for "data-src" and "data-srcset" attribute references.**
		s = "data-src",
		ss = "data-srcset",
		// Placeholders used for event handler strings.**
		y = ["scroll", "touchmove"],
		z = ["orientationchange", "resize"];

	// Tracks if yall is working. Used for throttling.
	let a = 0;

	// A multiple event binding handler.**
	let b = (obj, handlers, func, add)=>{
		handlers[fe]((handler)=>{
			add ? obj[ael](handler, func) : obj[rel](handler, func);
		});
	};

	// Replaces target attribute value with source attribute, if applicable
	let replaceAttr = (node, sattr, tattr)=>{
		let v = node[ga](sattr);
		if (v !== null) {
			node[tattr] = v;
			node[ra](sattr);
		}
	};

	// The guts of the lazy loader
	let yall = (els)=>{
		if(!document[qsa]("."+l).length){
			b(document, y, yall);
			b(window, z, yall);
			return;
		}

		if(!a){
			a = 1;

			setTimeout(()=>{
				els[fe]((img)=>{
					if(img[cl].contains(l) && img.getBoundingClientRect().top <= ((document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight + 50) && getComputedStyle(img, null).display != "none"){
						if(img.parentNode.tagName == "PICTURE"){
							let sources = [].slice.call(img.parentNode[qsa]("source"));

							sources[fe]((source)=>{
								replaceAttr(source, ss, "srcset");
							});
						}
						replaceAttr(img, s, "src");
						replaceAttr(img, ss, "srcset");
						img[cl].remove(l);
					}
				});

				a = 0;
			}, 200);
		}
	};

	// Everything's kicked off on DOMContentLoaded
	b(document, ["DOMContentLoaded"], ()=>{
		yall([].slice.call(document[qsa]("."+l)));
		b(document, y, yall, true);
		b(window, z, yall, true);
	}, true);
})(window, document);
