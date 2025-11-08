let lastScrollY = window.scrollY;
let scale = 1;
const image = document.querySelector(".zoom-image");
const image2 = document.querySelector(".zoom-image2");
const maxScale = 1.1;
const minScale = 1;

function updateScale() {
	const currentScrollY = window.scrollY;
	const delta = currentScrollY - lastScrollY;

	// Adjust scale based on scroll direction
	if (delta > 0) {
		scale += 0.01; // Scroll down - zoom in
	} else if (delta < 0) {
		scale -= 0.01; // Scroll up - zoom out
	}

	// Keep scale within bounds
	scale = Math.min(Math.max(minScale, scale), maxScale);

	// Apply transform
        if (image) {
                image.style.transform = `scale(${scale})`;
        }

        if (image2) {
                image2.style.transform = `scale(${scale})`;
        }

	// Update last scroll position
	lastScrollY = currentScrollY;
}

// Throttle scroll events using requestAnimationFrame
if (image || image2) {
        window.addEventListener("scroll", () => {
                window.requestAnimationFrame(updateScale);
        });
}

document.addEventListener("DOMContentLoaded", () => {
        if (!window.gsap) {
                console.warn("GSAP is required for cursor interactions");
                return;
        }

        const cursorItem = document.querySelector(".cursor");
        const targets = document.querySelectorAll("[data-cursor]");

        if (!cursorItem || !targets.length) {
                return;
        }

        const cursorParagraph = cursorItem.querySelector("p");

        if (!cursorParagraph) {
                return;
        }

        let xOffset = 6;
        let yOffset = 50;
        let cursorIsOnRight = false;
        let currentTarget = null;
        let lastText = "";

        // Position cursor relative to actual cursor position on page load
        gsap.set(cursorItem, { xPercent: xOffset, yPercent: yOffset });

        // Use GSAP quick.to for a more performative tween on the cursor
        const xTo = gsap.quickTo(cursorItem, "x", { ease: "power3" });
        const yTo = gsap.quickTo(cursorItem, "y", { ease: "power3" });

        // On mousemove, call the quickTo functions to the actual cursor position
        window.addEventListener("mousemove", (e) => {
                const windowWidth = window.innerWidth;
                const windowHeight = window.innerHeight;
                const scrollY = window.scrollY;
                const cursorX = e.clientX;
                const cursorY = e.clientY + scrollY; // Adjust cursorY to account for scroll

                // Default offsets
                let xPercent = xOffset;
                let yPercent = yOffset;

                // Adjust X offset if in the rightmost 19% of the window
                if (cursorX > windowWidth * 0.66) {
                        cursorIsOnRight = true;
                        xPercent = -100;
                } else {
                        cursorIsOnRight = false;
                }

                // Adjust Y offset if in the bottom 10% of the current viewport
                if (cursorY > scrollY + windowHeight * 0.9) {
                        yPercent = -120;
                }

                if (currentTarget) {
                        let newText = currentTarget.getAttribute("data-cursor");
                        if (currentTarget.hasAttribute("data-easteregg") && cursorIsOnRight) {
                                newText = currentTarget.getAttribute("data-easteregg");
                        }

                        if (newText !== lastText) {
                                cursorParagraph.innerHTML = newText;
                                lastText = newText;
                        }
                }

                gsap.to(cursorItem, {
                        xPercent,
                        yPercent,
                        duration: 0.9,
                        ease: "power3",
                });
                xTo(cursorX);
                yTo(cursorY - scrollY); // Subtract scroll for viewport positioning
        });

        // Add a mouse enter listener for each link that has a data-cursor attribute
        targets.forEach((target) => {
                target.addEventListener("mouseenter", () => {
                        currentTarget = target;

                        let newText = target.hasAttribute("data-easteregg")
                                ? target.getAttribute("data-easteregg")
                                : target.getAttribute("data-cursor");

                        if (newText !== lastText) {
                                cursorParagraph.innerHTML = newText;
                                lastText = newText;
                        }
                });
        });
});
 
