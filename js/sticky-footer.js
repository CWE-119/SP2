const stickyDiv = document.querySelector(".sticky_footer");
const footer = document.querySelector(".footer");
let lastScroll = 0;

window.addEventListener("scroll", () => {
	const currentScroll = window.scrollY;
	const scrollDirection = currentScroll > lastScroll ? "down" : "up";
	lastScroll = currentScroll;

	const stickyRect = stickyDiv.getBoundingClientRect();
	const footerRect = footer.getBoundingClientRect();

	// Only activate if footer isn't in view
	const footerOffset = footerRect.top - window.innerHeight;

	if (
		scrollDirection === "up" &&
		stickyRect.bottom > window.innerHeight &&
		footerOffset > 0
	) {
		stickyDiv.classList.add("sticky");
	} else if (scrollDirection === "down" || footerOffset <= 0) {
		stickyDiv.classList.remove("sticky");
	}
});
