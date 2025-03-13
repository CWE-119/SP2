gsap.registerPlugin(ScrollTrigger);

// Based on this forum post: https://gsap.com/community/forums/topic/32738-increase-speed-of-marquee-when-user-scroll/

const initMarquees = () => {
	const ambassadors = [...document.querySelectorAll(".ambassadors--gsap")];
	if (ambassadors) {
		const marqueeObject = {
			top: {
				el: null,
				width: 0,
			},
			bottom: {
				el: null,
				width: 0,
			},
		};
		ambassadors.forEach((ambassadorBlock) => {
			marqueeObject.top.el = ambassadorBlock.querySelector(".ambassadors__top");
			marqueeObject.bottom.el = ambassadorBlock.querySelector(
				".ambassadors__bottom"
			);
			marqueeObject.top.width = marqueeObject.top.el.offsetWidth;
			marqueeObject.bottom.width = marqueeObject.bottom.el.offsetWidth;
			marqueeObject.top.el.innerHTML += marqueeObject.top.el.innerHTML;
			marqueeObject.bottom.el.innerHTML += marqueeObject.bottom.el.innerHTML;

			let dirFromLeft = "-=50%";
			let dirFromRight = "+=50%";
			let master = gsap
				.timeline()
				.add(marquee(marqueeObject.top.el, 20, dirFromLeft), 0)
				.add(marquee(marqueeObject.bottom.el, 20, dirFromRight), 0);
			let tween = gsap.to(master, {
				duration: 1.5,
				timeScale: 1,
				paused: true,
			});
			let timeScaleClamp = gsap.utils.clamp(1, 6);
			// disabling the scrolltrigger doesn't matter for the flashing incoming new items:
			ScrollTrigger.create({
				start: 0,
				end: "max",
				onUpdate: (self) => {
					master.timeScale(timeScaleClamp(Math.abs(self.getVelocity() / 200)));
					tween.invalidate().restart();
				},
			});
		});
	}
};

const marquee = (item, time, direction) => {
	let mod = gsap.utils.wrap(0, 50);
	return gsap.to(item, {
		duration: time,
		ease: "none",
		x: direction,
		modifiers: {
			x: (x) => (direction = mod(parseFloat(x)) + "%"),
		},
		repeat: -1,
	});
};

initMarquees();
