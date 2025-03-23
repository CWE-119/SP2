document.addEventListener("DOMContentLoaded", function () {
    const ease = "power4.inOut";
    const fadeEase = "power2.inOut";
    const transitionDiv = document.querySelector(".transition");

    // Initialize transition state
    gsap.set(transitionDiv, {
        opacity: 1,
    });

    // Handle navigation clicks
    document.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");
            if (href && !href.startsWith("#") && href !== window.location.pathname) {
                event.preventDefault();
                sessionStorage.setItem("isTransitioning", "true");
                
                // EXIT ANIMATION SEQUENCE
                animateTransition().then(() => {
                    window.location.href = href;
                });
            }
        });
    });

    // Initial page load handling
    if (sessionStorage.getItem("isTransitioning")) {
        sessionStorage.removeItem("isTransitioning");
        // ENTRANCE ANIMATION SEQUENCE
        revealTransition();
    } else {
        // Initial page load without transition
        gsap.set(transitionDiv, {opacity: 0 });
    }

    function revealTransition() {
        return new Promise((resolve) => {
            gsap.timeline()
                .set(".block", { scaleY: 1 })
                .to(".block", {
                    scaleY: 0,
                    duration: 1,
                    stagger: {
                        each: 0.1,
                        from: "start",
                        grid: "auto",
                        axis: "x"
                    },
                    ease: ease
                })
                .to(transitionDiv, {
                    opacity: 0,
                    duration: 0.5,
                    ease: fadeEase,
                    onComplete: () => {
                        
                        resolve();
                    }
                }, "-=0.3");
        });
    }

    function animateTransition() {
        return new Promise((resolve) => {
            gsap.timeline()
                .to(transitionDiv, {
                    opacity: 1,
                    duration: 0.5,
                    ease: fadeEase
                })
                .set(".block", { scaleY: 0 })
                .to(".block", {
                    scaleY: 1,
                    duration: 1,
                    stagger: {
                        each: 0.1,
                        from: "start",
                        grid: [2, 5],
                        axis: "x"
                    },
                    ease: ease,
                    onComplete: resolve
                }, "-=0.2");
        });
    }
});