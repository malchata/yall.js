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
		// Placeholders used common method names.**
		qsa = "querySelectorAll",
	    sa = "setAttribute",
		ga = "getAttribute",
		ra = "removeAttribute",
		ael = "addEventListener",
		rel = "removeEventListener",
		// Placeholders used for "data-src" and "data-srcset" attribute references.**
		s = "data-src",
		ss = "data-srcset",
		// Placeholders used for event handler strings.**
		y = "scroll touchmove",
		z = "orientationchange resize";

	// Tracks if yall is working. Used for throttling.
	let a = false;

	// A multiple event binding handler.**
	let b = (obj, handlers, func, add)=>{
		handlers.split(" ").forEach((handler)=>{
			add ? obj[ael](handler, func) : obj[rel](handler, func);
		});
	};

	// The guts of the lazy loader
	let yall = ()=>{
		if(!document[qsa](".lazy").length){
			b(document, y, yall);
			b(window, z, yall);
			return;
		}

		if(!a){
			a = true;

			setTimeout(()=>{
				yall.i.forEach((img)=>{
					if(img.getBoundingClientRect().top <= ((document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight + 100) && getComputedStyle(img, null).display != "none"){
						if(img.parentNode.tagName == "PICTURE"){
							let sources = [].slice.call(img.parentNode[qsa]("source"));

							sources.forEach((source)=>{
								let sourceSrcset = source[ga](ss);

								if(sourceSrcset != null){
									source[sa]("srcset", sourceSrcset);
									source[ra](ss);
								}
							});
						}

						let imgSrc = img[ga](s);
						let imgSrcset = img[ga](ss);

						if(imgSrc != null){
							img.src = imgSrc;
							img[ra](s);
						}

						if(imgSrcset != null){
							img.srcset = imgSrcset;
							img[ra](ss);
						}

						img.classList.remove("lazy");
					}
				});

				a = false;
			}, 200);
		}
	};	

	// Everything's kicked off on DOMContentLoaded
	b(document, "DOMContentLoaded", ()=>{
		yall.i = [].slice.call(document[qsa](".lazy"));
		yall();
		b(document, y, yall, true);
		b(window, z, yall, true);
	}, true);
})(window, document);
