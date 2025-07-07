// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const path = require("path");

// async function scrollPage(page, maxScrolls = 50) {
// 	let scrollCount = 0;
// 	let lastHeight = 0;
// 	let consecutiveStalls = 0;

// 	while (scrollCount < maxScrolls) {
// 		// Scroll further down
// 		await page.evaluate(() => {
// 			window.scrollBy(0, window.innerHeight * 5);
// 		});
// 		await new Promise((resolve) => setTimeout(resolve, 2500)); // Increased wait time

// 		// Check for new content
// 		const newHeight = await page.evaluate(() => document.body.scrollHeight);
// 		if (newHeight === lastHeight) {
// 			consecutiveStalls++;
// 			// If we haven't loaded new content in 3 scrolls, break
// 			if (consecutiveStalls >= 5) {
// 				console.log("🚫 No new content - stopping scroll");
// 				break;
// 			}
// 		} else {
// 			consecutiveStalls = 0;
// 		}

// 		lastHeight = newHeight;
// 		scrollCount++;
// 		console.log(`↕️ Scrolled ${scrollCount} times (${newHeight}px)`);

// 		// Check for "End of Feed" marker
// 		const endOfFeed = await page.evaluate(() => {
// 			return document.querySelector('[data-test-id="end-of-feed"]') !== null;
// 		});
// 		if (endOfFeed) {
// 			console.log("🏁 Reached Pinterest's end of feed");
// 			break;
// 		}
// 	}
// }

// async function getCreatedPins(page) {
// 	return await page.evaluate(() => {
// 		const pins = [];

// 		// Find all pin containers
// 		const pinContainers = Array.from(
// 			document.querySelectorAll('div[data-test-id="pinWrapper"]')
// 		);

// 		pinContainers.forEach((container) => {
// 			try {
// 				// Find the image element
// 				const img = container.querySelector("img");
// 				if (!img || !img.src) return;

// 				// Extract the highest quality version
// 				let src = img.src;

// 				// Pinterest uses multiple URL patterns:
// 				if (src.includes("/236x/") || src.includes("/564x/")) {
// 					src = src.replace(/\/\d+x(\d+)?\//, "/originals/");
// 				} else if (src.includes("pinimg.com") && !src.includes("/originals/")) {
// 					// Handle other formats
// 					src = src.replace(/(\/[a-f0-9]+)\.([a-z]{3,4})$/, "/originals$1.$2");
// 				}

// 				// Verify it's a pinimg.com URL
// 				if (src.includes("pinimg.com")) {
// 					pins.push(src);
// 				}
// 			} catch (e) {
// 				console.error("Error processing pin:", e);
// 			}
// 		});

// 		return pins;
// 	});
// }

// async function scrapeCreatedPins(username) {
// 	const browser = await puppeteer.launch({
// 		headless: false, // Set to true for production
// 		args: [
// 			"--no-sandbox",
// 			"--disable-setuid-sandbox",
// 			"--disable-dev-shm-usage",
// 		],
// 	});
// 	const page = await browser.newPage();

// 	// Configure browser to look like a real user
// 	await page.setViewport({ width: 1920, height: 1080 });
// 	await page.setUserAgent(
// 		"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
// 	);
// 	await page.setExtraHTTPHeaders({
// 		"Accept-Language": "en-US,en;q=0.9",
// 	});

// 	const profileUrl = `https://www.pinterest.com/${username}/_created/`;
// 	console.log(`🌐 Opening profile: ${profileUrl}`);

// 	try {
// 		await page.goto(profileUrl, {
// 			waitUntil: "networkidle2",
// 			timeout: 90000, // 90 seconds timeout
// 		});

// 		// Wait for pins to load
// 		await page.waitForSelector('div[data-test-id="pinWrapper"]', {
// 			timeout: 30000,
// 		});
// 		console.log("✅ Initial pins loaded");

// 		console.log("🔄 Scrolling to load ALL pins...");
// 		await scrollPage(page);

// 		console.log("📸 Extracting ALL pin images...");
// 		const imageLinks = await getCreatedPins(page);

// 		// Filter and deduplicate
// 		const uniqueLinks = [
// 			...new Set(
// 				imageLinks.filter(
// 					(link) =>
// 						link.includes("pinimg.com") &&
// 						!link.includes("avatar") &&
// 						!link.includes("logo")
// 				)
// 			),
// 		];

// 		console.log(`✅ Found ${uniqueLinks.length} created pins`);

// 		// Save results
// 		const outputPath = path.join(__dirname, "imageLinks.js");
// 		const jsContent = `export const imageLinks = ${JSON.stringify(
// 			uniqueLinks,
// 			null,
// 			2
// 		)};\n`;
// 		fs.writeFileSync(outputPath, jsContent);
// 		console.log(`💾 Saved ALL images to ${outputPath}`);

// 		return uniqueLinks;
// 	} catch (error) {
// 		console.error("❌ Scraping failed:", error);
// 		// Take screenshot for debugging
// 		await page.screenshot({ path: "error-screenshot.png" });
// 		return [];
// 	} finally {
// 		await browser.close();
// 	}
// }

// (async () => {
// 	const username = "scenestealmedia"; // Replace with target username
// 	const pins = await scrapeCreatedPins(username);
// 	console.log(`Total images captured: ${pins.length}`);
// })();



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
			link: "https://www.youtube.com/embed/dQw4w9WgXcQ", // YouTube video
			type: "1",
			mediaType: "youtube",
		},
		{
			link: "https://www.instagram.com/reel/CrYKenNveGZ/", // Instagram Reel
			type: "2",
			mediaType: "reel",
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
			} else if (item.mediaType === "reel") {
				const reelId = item.link.split("/").filter(Boolean).pop();
				mediaElement.innerHTML = `
                    <iframe 
                        src="https://www.instagram.com/reel/${reelId}/embed/"
                        frameborder="0"
                        scrolling="no"
                        allowtransparency="true"
                        allowfullscreen>
                    </iframe>
                `;
			}

			imageList.appendChild(mediaElement);
		});

		// Append the complete image list to container
		mediaContainer.appendChild(imageList);
	}

	// Helper to extract YouTube ID
	function extractYouTubeId(url) {
		const regExp =
			/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	}

	function applyFilters() {
		const filtered = mediaData.filter((item) => {
			// Map media types to groups
			let mediaGroup = item.mediaType;
			if (item.mediaType === "youtube" || item.mediaType === "reel") {
				mediaGroup = "video"; // Group YouTube and Reels with videos
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
		videoButton.textContent = "Videos & Reels";
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














