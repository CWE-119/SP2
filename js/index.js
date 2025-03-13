console.log("Helo World");
let lastScrollY = window.scrollY;
let scale = 1;
const image = document.querySelector(".zoom-image");
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
	image.style.transform = `scale(${scale})`;

	// Update last scroll position
	lastScrollY = currentScrollY;
}

// Throttle scroll events using requestAnimationFrame
window.addEventListener("scroll", () => {
	window.requestAnimationFrame(updateScale);
});