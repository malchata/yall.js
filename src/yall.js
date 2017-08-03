/**
 * yall.js
 * Yet Another Lazy loader
 * This library is intended to be very small. As such, some of it is not going to be easily readable.
 * I don't normally code like this, but I wanted to see just how small I could get this library.
 * There may yet be a pattern out there that can yield a smaller library than this.
 **/

((window, document)=>{
	let yall = {
		/** Object members are defined here.
		  * Anything suffixed with a double asterisk (**)
		  * indicates that it was defined solely to shave
		  * bytes from the final build.
		  **/

		// Tracks if yall is working. Used for throttling.
		a: false,

		// A multiple event binding handler.**
		b: (obj, handlers, func, add)=>{
			handlers.split(" ").forEach((handler)=>{
				add ? obj.addEventListener(handler, func) : obj.removeEventListener(handler, func);
			});
		},

		// Placeholders used for "data-src" and "data-srcset" attribute references.**
		s: "data-src",
		ss: "data-srcset",

		// Placeholders used for event handler strings.**
		y: "scroll touchmove",
		z: "orientationchange resize",

		// The guts of the lazy loader
		g: ()=>{
			if(!document.querySelectorAll(".lazy").length){
				yall.b(document, yall.y, yall.g);
				yall.b(window, yall.z, yall.g);
				return;
			}

			if(!yall.a){
				yall.a = true;

				setTimeout(()=>{
					yall.i.forEach((img)=>{
						if(img.getBoundingClientRect().top <= ((document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight + 100) && getComputedStyle(img, null).display != "none"){
							if(img.parentNode.tagName == "PICTURE"){
								let sources = [].slice.call(img.parentNode.querySelectorAll("source"));

								sources.forEach((source)=>{
									let sourceSrcset = source.getAttribute(yall.ss);

									if(sourceSrcset != null){
										source.setAttribute("srcset", sourceSrcset);
										source.removeAttribute(yall.ss);
									}
								});
							}

							let imgSrc = img.getAttribute(yall.s);
							let imgSrcset = img.getAttribute(yall.ss);

							if(imgSrc != null){
								img.src = imgSrc;
								img.removeAttribute(yall.s);
							}

							if(imgSrcset != null){
								img.srcset = imgSrcset;
								img.removeAttribute(yall.ss);
							}

							img.classList.remove("lazy");
						}
					});

					yall.a = false;
				}, 200);
			}
		}
	};

	// Everything's kicked off on DOMContentLoaded
	yall.b(document, "DOMContentLoaded", ()=>{
		yall.i = [].slice.call(document.querySelectorAll(".lazy"));
		yall.g();
		yall.b(document, yall.y, yall.g, true);
		yall.b(window, yall.z, yall.g, true);
	}, true);
})(window, document);
