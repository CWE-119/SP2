new Glide(".glide2", {
	type: "carousel",
	startAt: 0,
	// autoplay: 2000,
	// hoverpause: true,
	perView: 3,
	breakpoints: {
		800: {
			perView: 2,
		},
		500: {
			perView: 1,
		},
	},
}).mount();
