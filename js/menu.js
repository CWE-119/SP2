document.addEventListener("DOMContentLoaded", () => {
        if (!window.gsap || !window.CustomEase) {
                console.warn("GSAP with CustomEase is required for menu interactions");
                return;
        }

        gsap.registerPlugin(CustomEase);
        CustomEase.create(
                "hop",
                "M0,0 C0.354,0 0.464,0.133 0.498,0.502 0.532,0.872 0.651,1 1,1"
        );

        const menuToggle = document.querySelector(".menu-toggle");
        const menu = document.querySelector(".menu");
        const links = document.querySelectorAll(".h-link");
        const socialLinks = document.querySelectorAll(".socials p");
        let isAnimating = false;

        if (!menuToggle || !menu) {
                return;
        }

	const splitTextIntoSpans = (selector) => {
		let elements = document.querySelectorAll(selector);
		elements.forEach((element) => {
			let text = element.innerText;
			let splitText = text
				.split("")
				.map(function (char) {
					return `<span>${char === " " ? "&nbsp;&nbsp;" : char}</span>`;
				})
				.join("");
			element.innerHTML = splitText;
		});
	};
	splitTextIntoSpans(".header-menu h1");

	menuToggle.addEventListener("click", () => {
		if (isAnimating) return;

                if (menuToggle.classList.contains("closed")) {
                        menuToggle.classList.remove("closed");
                        menuToggle.classList.add("opened");
                        menuToggle.setAttribute("aria-expanded", "true");
                        menuToggle.setAttribute("aria-label", "Close navigation");

			isAnimating = true;

			// Disable scrolling
			document.body.classList.add("menu-opened");

			gsap.to(menu, {
				clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
				ease: "hop",
				duration: 1.5,
				onStart: () => {
					menu.style.pointerEvents = "all";
				},
				onComplete: () => {
					isAnimating = false;
				},
			});

			gsap.to(links, {
				y: 0,
				opacity: 1,
				stagger: 0.1,
				delay: 0.85,
				duration: 1,
				ease: "power3.out",
			});

			gsap.to(socialLinks, {
				y: 0,
				opacity: 1,
				stagger: 0.05,
				delay: 0.85,
				duration: 1,
				ease: "power3.out",
			});

			gsap.to(".video-wrapper", {
				clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
				ease: "hop",
				duration: 1.5,
				delay: 0.5,
			});

			gsap.to(".header-menu h1 span", {
				rotateY: 0,
				stagger: 0.05,
				delay: 0.75,
				duration: 1.5,
				ease: "power4.out",
			});

			gsap.to(".header-menu h1 span", {
				y: 0,
				scale: 1,
				stagger: 0.05,
				delay: 0.5,
				duration: 1.5,
				ease: "power4.out",
			});
                } else {
                        menuToggle.classList.remove("opened");
                        menuToggle.classList.add("closed");
                        menuToggle.setAttribute("aria-expanded", "false");
                        menuToggle.setAttribute("aria-label", "Open navigation");

			isAnimating = true;

			// Re-enable scrolling
			document.body.classList.remove("menu-opened");

			gsap.to(menu, {
				clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
				ease: "hop",
				duration: 1.5,
				onComplete: () => {
					menu.style.pointerEvents = "none";
					gsap.set(menu, {
						clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
					});

					gsap.set(links, { y: 30, opacity: 0 });
					gsap.set(socialLinks, { y: 30, opacity: 0 });
					gsap.set(".video-wrapper", {
						clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
					});
					gsap.set(".header-menu h1 span", {
						y: 500,
						rotateY: 90,
						scale: 0.75,
					});

					isAnimating = false;
				},
			});
		}
	});
});
