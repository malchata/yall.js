((window, document)=>{
	let yall = {
		images: null,
		active: false,
		scan: ()=>{
			if(document.querySelectorAll(".lazy").length === 0){
				document.removeEventListener("scroll", yall.scan);
				document.removeEventListener("touchmove", yall.scan);
				window.removeEventListener("orientationchange", yall.scan);
				window.removeEventListener("resize", yall.scan);
				return;
			}

			if(yall.active === false){
				yall.active = true;

				setTimeout(()=>{
					yall.images.forEach((image)=>{
						if(image.className.indexOf("lazy") !== -1){
							if(image.offsetTop <= ((document.body.scrollTop || document.documentElement.scrollTop) + window.innerHeight + 100) && (image.currentStyle ? image.currentStyle.display : getComputedStyle(image, null).display) !== "none"){
								yall.load(image);
							}
						}
					});

					yall.active = false;
				}, 200);
			}
		},
		load: (img)=>{
			if(img.parentNode.tagName === "PICTURE"){
				let sources = [].slice.call(img.parentNode.querySelectorAll("source"));

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

			img.classList.remove("lazy");
		}
	};

	document.addEventListener("DOMContentLoaded", ()=>{
		yall.images = [].slice.call(document.querySelectorAll(".lazy"));
		yall.scan();
		document.addEventListener("scroll", yall.scan);
		document.addEventListener("touchmove", yall.scan);
		window.addEventListener("orientationchange", yall.scan);
		window.addEventListener("resize", yall.scan);
	});
})(window, document);
