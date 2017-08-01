((window, document)=>{
	const yall = {
		lazyClass: "lazy",
		images: null,
		working: false,
		throttle: 200,
		buffer: 50,
		init: ()=>{
			yall.images = [].slice.call(document.querySelectorAll(`.${yall.lazyClass}`));
			yall.scan();
			document.addEventListener("scroll", yall.scan);
			document.addEventListener("touchmove", yall.scan);
			window.addEventListener("orientationchange", yall.scan);
			window.addEventListener("resize", yall.scan);
		},
		scan: ()=>{
			if(document.querySelectorAll(`.${yall.lazyClass}`).length === 0){
				document.removeEventListener("scroll", yall.scan);
				document.removeEventListener("touchmove", yall.scan);
				window.removeEventListener("orientationchange", yall.scan);
				window.removeEventListener("resize", yall.scan);
				return;
			}

			if(yall.working === false){
				yall.working = true;

				setTimeout(()=>{
					yall.images.forEach((image)=>{
						if(image.className.indexOf("lazy") !== -1){
							if(yall.inViewport(image)){
								yall.loadImage(image);
							}
						}
					});

					yall.working = false;
				}, yall.throttle);
			}
		},
		inViewport: (img)=>{
			let top = ((document.body.scrollTop || document.documentElement.scrollTop) + window.innerHeight) + yall.buffer;
			let isVisible = img.currentStyle ? img.currentStyle.display : getComputedStyle(img, null).display;
			return img.offsetTop <= top && isVisible !== "none";
		},
		loadImage: (img)=>{
			if(img.parentNode.tagName === "PICTURE"){
				let sources = [].slice.call(img.parentNode.getElementsByTagName("source"));

				sources.forEach((source)=>{
					let sourceSrcset = source.getAttribute("data-srcset");

					if(sourceSrcset !== null){
						source.setAttribute("srcset", sourceSrcset);
						source.removeAttribute("data-srcset");
					}
				});
			}

			let imgSrc = img.getAttribute("data-src");
			let imgSrcset = img.getAttribute("data-srcset");

			if(imgSrc !== null){
				img.setAttribute("src", imgSrc);
				img.removeAttribute("data-src");
			}

			if(imgSrcset !== null){
				img.setAttribute("srcset", imgSrcset);
				img.removeAttribute("data-srcset");
			}

			img.classList.remove(yall.lazyClass);
			img.removeAttribute("style");
		}
	};

	document.addEventListener("DOMContentLoaded", yall.init);
})(window, document);
