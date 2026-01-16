document.addEventListener("DOMContentLoaded", () => {
	// Sample media data with YouTube and Reels
	const mediaData = [
		{
			link: "https://i.pinimg.com/736x/96/44/f7/9644f78b9200bafdb6d2c978b42609ea.jpg",
			type: "1",
			mediaType: "image",
		},
		{
			link: "wedding-vid.mp4",
			type: "1",
			mediaType: "video",
		},
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
		{
			link: "product-vid.mp4",
			type: "1",
			mediaType: "video",
		},
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
			link: "https://www.youtube.com/embed/UiUNIDhs_ag", // YouTube video
			type: "1",
			mediaType: "youtube",
		},
		{
			link: "https://youtube.com/shorts/RlC5Fx_09hM?si=4KJEXPIgqzaVN5C1", // Instagram Reel
			type: "3",
			mediaType: "short",
		},
		// ... (other image entries) ...
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
			mediaElement.dataset.mediaType = item.mediaType;
			mediaElement.style.breakInside = "avoid";

			if (item.mediaType === "image") {
				mediaElement.innerHTML = `
                    <img src="${item.link}" alt="${item.type}" loading="lazy">
                `;
			} else if (item.mediaType === "video") {
				mediaElement.innerHTML = `
                    <video controls>
                        <source src="${item.link}" type="video/mp4">
                    </video>
                `;
			} else if (item.mediaType === "youtube") {
				// Extract YouTube ID if needed
				const youtubeId = extractYouTubeId(item.link);
				const embedUrl = youtubeId
					? `https://www.youtube.com/embed/${youtubeId}`
					: item.link;

				mediaElement.innerHTML = `
                    <iframe 
                        src="${embedUrl}" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                `;
			} else if (item.mediaType === "short") {
				const youtubeId = extractYouTubeId(item.link);
				const embedUrl = youtubeId
					? `https://www.youtube.com/embed/${youtubeId}`
					: item.link;

				mediaElement.innerHTML = `
					<iframe 
						src="${embedUrl}" 
						frameborder="0" 
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
						allowfullscreen>
					</iframe>
				`;
			}

			imageList.appendChild(mediaElement);
		});

		// Append the complete image list to container
		mediaContainer.appendChild(imageList);
	}

	function extractYouTubeId(url) {
		const regExp =
			/^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return match && match[1].length === 11 ? match[1] : null;
	}


	function applyFilters() {
		const filtered = mediaData.filter((item) => {
			// Map media types to groups
			let mediaGroup = item.mediaType;
			if (["youtube", "short"].includes(item.mediaType)) {
				mediaGroup = "video"; // group shorts and youtube with videos
			}

			const typeValid =
				activeFilters.mediaTypes.size === 0 ||
				activeFilters.mediaTypes.has(mediaGroup);

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

	// Update button text for video filter
	const videoButton = document.querySelector('[data-filter-type="video"]');
	if (videoButton) {
		videoButton.textContent = "Videos";
	}
});

// Media item click handler
document.querySelector(".all-contents").addEventListener("click", (e) => {
	const mediaItem = e.target.closest(".media-item");
	if (!mediaItem) return;

	const mediaType = mediaItem.dataset.mediaType;
	const mediaSrc = mediaItem.querySelector("img, video")?.currentSrc;

	if (mediaType === "image") {
		// Handle image zoom
		const modal = document.querySelector(".image-modal");
		const modalImg = modal.querySelector(".modal-content");
		modal.style.display = "block";
		modalImg.src = mediaSrc;
	} else if (mediaType === "video") {
		// Handle video playback
		const video = mediaItem.querySelector("video");
		if (video.paused) {
			video.play();
		} else {
			video.pause();
		}
	}
	// YouTube and Reels don't need special click handlers
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