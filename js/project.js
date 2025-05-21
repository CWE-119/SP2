document.addEventListener("DOMContentLoaded", () => {
	// Sample media data
	const mediaData = [
		{
			link: "https://i.pinimg.com/736x/96/44/f7/9644f78b9200bafdb6d2c978b42609ea.jpg",
			type: "1",
			mediaType: "image",
		},
		{ link: "wedding-vid.mp4", type: "1", mediaType: "video" },
		{
			link: "https://i.pinimg.com/736x/96/44/f7/9644f78b9200bafdb6d2c978b42609ea.jpg",
			type: "2",
			mediaType: "image",
		},
		{
			link: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
			type: "2",
			mediaType: "video",
		},
		{ link: "product-vid.mp4", type: "1", mediaType: "video" },
		{
			link: "https://i.pinimg.com/736x/d8/9f/4a/d89f4a89a167e80c451a349862afae58.jpg.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/9c/97/cf/9c97cffbd57f72ecc17a25a21e7d55db.jpg",
			type: "2",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/77/fd/67/77fd677b221076a699055c4e753f3353.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/ff/c7/45/ffc74569c281b284f3f196bed5485d80.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/de/b9/a2/deb9a2611dbe5e245c227b2de89b5199.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/3b/9d/e8/3b9de8eb49075afda77c16261bfc0e7d.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/04/f6/fe/04f6fe4e2cc9ac4a999432032bd24584.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/4d/51/5b/4d515b2c8dee0d812cacafbddb5e026c.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/9e/56/b4/9e56b44d9a8a4941d63400c8dae47657.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/92/18/57/921857c95c13669a593da3ded0bf7c6b.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/60/5b/59/605b593d179dfb51d3b65662032f04eb.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/b4/f3/a3/b4f3a3148f1a6bf620036de74296c18f.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/94/3b/aa/943baaa1efb7a8e1045e8c52c93a0511.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/7d/07/69/7d0769a90665a0ab630082dc63cc2c91.jpg",
			type: "2",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/f4/eb/92/f4eb9223ef170cb2087a9f79a4675b28.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/7c/7a/eb/7c7aeb00aec94c04a2a9a680f35a6ef8.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/d4/d5/4c/d4d54c78c728c561b27d74712d1c6bc3.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/15/e6/ae/15e6aeba2a2ec915f55d55e61901f0a0.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "https://i.pinimg.com/736x/15/e6/ae/15e6aeba2a2ec915f55d55e61901f0a0.jpg",
			type: "2",
			mediaType: "image",
		},
	];

	// DOM Elements
	const mediaContainer = document.querySelector(".all-contents");
	let activeFilters = {
		mediaTypes: new Set(),
		categories: new Set(),
	};

	// Initial render
	renderMedia(mediaData);

	function renderMedia(items) {
		mediaContainer.innerHTML = ""; // Clear existing content

		// Create main image list container
		const imageList = document.createElement("div");
		imageList.className = "image-list";

		// Create and append media items
		items.forEach((item) => {
			const mediaElement = document.createElement("div");
			mediaElement.className = "media-item";

			if (item.mediaType === "image") {
				mediaElement.innerHTML = `
					<img src="${item.link}" alt="${item.type}" loading="lazy">
				`;
			} else {
				mediaElement.innerHTML = `
					<video controls>
						<source src="${item.link}" type="video/mp4">
					</video>
				`;
			}

			imageList.appendChild(mediaElement);
		});

		// Append the complete image list to container
		mediaContainer.appendChild(imageList);
	}

	function applyFilters() {
		const filtered = mediaData.filter((item) => {
			const typeValid =
				activeFilters.mediaTypes.size === 0 ||
				activeFilters.mediaTypes.has(item.mediaType);
			const categoryValid =
				activeFilters.categories.size === 0 ||
				activeFilters.categories.has(item.type);
			return typeValid && categoryValid;
		});
		renderMedia(filtered);
	}

	// Dropdown functionality
	document.querySelectorAll(".dropdown-toggle").forEach((toggle) => {
		toggle.addEventListener("click", (e) => {
			e.stopPropagation();
			const dropdown = toggle.closest(".dropdown");
			const menu = dropdown.querySelector(".dropdown-menu");
			menu.classList.toggle("show");
			dropdown.classList.toggle("active");
		});
	});

	// Category selection
	// document.querySelectorAll(".category-item").forEach((item) => {
	// 	item.addEventListener("click", (e) => {
	// 		const category = item.dataset.category;
	// 		const isAll = category === "all";

	// 		document
	// 			.querySelectorAll(".category-item")
	// 			.forEach((i) => i.classList.remove("active"));
	// 		item.classList.add("active");

	// 		if (isAll) {
	// 			activeFilters.categories.clear();
	// 		} else {
	// 			activeFilters.categories.clear();
	// 			activeFilters.categories.add(category);
	// 		}

	// 		applyFilters();
	// 		document.querySelector(".dropdown-menu").classList.remove("show");
	// 	});
	// });

	document.querySelectorAll(".category-item").forEach((item) => {
		item.addEventListener("click", (e) => {
			const category = item.dataset.category;
			const isAll = category === "all";

			if (isAll) {
				activeFilters.categories.clear();
				document
					.querySelectorAll(".category-item")
					.forEach((i) => i.classList.remove("active"));
				item.classList.add("active");
			} else {
				// Toggle selection
				item.classList.toggle("active");
				if (item.classList.contains("active")) {
					activeFilters.categories.add(category);
				} else {
					activeFilters.categories.delete(category);
				}

				// Remove 'all' selection if present
				if (activeFilters.categories.size > 0) {
					document
						.querySelector('[data-category="all"]')
						.classList.remove("active");
				}
			}

			updateCategoryCount();
			applyFilters();
			document.querySelector(".dropdown-menu").classList.remove("show");
		});
	});

	// Add count update function
	function updateCategoryCount() {
		const count = activeFilters.categories.size;
		const countElement = document.querySelector(".category-count");
		countElement.textContent = `(${count})`;

		// Hide count when 0
		countElement.style.display = count > 0 ? "inline-block" : "none";
	}

	// Initialize count display
	updateCategoryCount();

	// Media type selection
	document.querySelectorAll(".selection-button").forEach((button) => {
		button.addEventListener("click", () => {
			button.classList.toggle("active");
			const type = button.dataset.filterType;

			if (button.classList.contains("active")) {
				activeFilters.mediaTypes.add(type);
			} else {
				activeFilters.mediaTypes.delete(type);
			}

			applyFilters();
		});
	});

	// Close dropdowns when clicking outside
	document.addEventListener("click", (e) => {
		if (!e.target.closest(".dropdown")) {
			document.querySelectorAll(".dropdown-menu").forEach((menu) => {
				menu.classList.remove("show");
			});
			document.querySelectorAll(".dropdown").forEach((d) => {
				d.classList.remove("active");
			});
		}
	});
});


document.querySelector(".all-contents").addEventListener("click", (e) => {
	const mediaItem = e.target.closest(".media-item");
	if (!mediaItem) return;

	const mediaSrc = mediaItem.querySelector("img, video").currentSrc;

	if (mediaItem.querySelector("img")) {
		// Handle image zoom
		const modal = document.querySelector(".image-modal");
		const modalImg = modal.querySelector(".modal-content");
		modal.style.display = "block";
		modalImg.src = mediaSrc;
	} else {
		// Handle video playback
		const video = mediaItem.querySelector("video");
		if (video.paused) {
			video.play();
		} else {
			video.pause();
		}
	}
});

// Close modal functionality
document.querySelector(".close-modal").addEventListener("click", () => {
	document.querySelector(".image-modal").style.display = "none";
});

// Close when clicking outside
window.addEventListener("click", (e) => {
	if (e.target.classList.contains("image-modal")) {
		document.querySelector(".image-modal").style.display = "none";
	}
});

// Close with ESC key
document.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		document.querySelector(".image-modal").style.display = "none";
	}
});