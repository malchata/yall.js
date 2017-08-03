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
		// Placeholder used for the lazy loading class**
		l = "lazy",
		// Placeholders used for "data-src" and "data-srcset" attribute references.**
		s = "data-src",
		ss = "data-srcset",
		// Placeholders used for event handler strings.**
		y = ["scroll", "touchmove"],
		z = ["orientationchange", "resize"];

	// Tracks if yall is working. Used for throttling.
	let a = false;

	// A multiple event binding handler.**
	let b = (obj, handlers, func, add)=>{
		handlers.forEach((handler)=>{
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
	let yall = ()=>{
		if(!document[qsa]("."+l).length){
			b(document, y, yall);
			b(window, z, yall);
			return;
		}

		if(!a){
			a = true;

			setTimeout(()=>{
				yall.i.forEach((img)=>{
					if(img[cl].contains(l) && img.getBoundingClientRect().top <= ((document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight + 50) && getComputedStyle(img, null).display != "none"){
						if(img.parentNode.tagName == "PICTURE"){
							let sources = [].slice.call(img.parentNode[qsa]("source"));

							sources.forEach((source)=>{
								replaceAttr(source, ss, "srcset");
							});
						}
						replaceAttr(img, s, "src");
						replaceAttr(img, ss, "srcset");
						img[cl].remove(l);
					}
				});

				a = false;
			}, 200);
		}
	};

	// Everything's kicked off on DOMContentLoaded
	b(document, "DOMContentLoaded", ()=>{
		yall.i = [].slice.call(document[qsa]("."+l));
		yall();
		b(document, y, yall, true);
		b(window, z, yall, true);
	}, true);
})(window, document);
