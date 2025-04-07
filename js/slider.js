new Glide(".glide2", {
	type: "carousel",
	startAt: 1,
	// autoplay: 2000,
	// hoverpause: true,
	perView: 3,
	touchRatio: 1,
	touchAngle: 45,
	swipeThreshold: 80,
	dragThreshold: 120,
	breakpoints: {
		800: {
			perView: 2,
		},
		500: {
			perView: 1,
		},
	},
}).mount();

new Glide(".glide", {
	type: "carousel",
	startAt: 0,
	autoplay: 2000,
	hoverpause: true,
	perView: 3,
	gap: 20,
	touchRatio: 1,
	touchAngle: 45,
	swipeThreshold: 80,
	dragThreshold: 120,
	breakpoints: {
		760: {
			perView: 2,
		},
		500: {
			perView: 1,
		},
	},
	grow: true,
}).mount();
