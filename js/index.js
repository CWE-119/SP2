console.log("Helo World");
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
	image.style.transform = `scale(${scale})`;
	image2.style.transform = `scale(${scale})`;

	// Update last scroll position
	lastScrollY = currentScrollY;
}

// Throttle scroll events using requestAnimationFrame
window.addEventListener("scroll", () => {
	window.requestAnimationFrame(updateScale);
});

 document.addEventListener("DOMContentLoaded", ()=>{
   
  let cursorItem = document.querySelector(".cursor")
  let cursorParagraph = cursorItem.querySelector("p")
  let targets = document.querySelectorAll("[data-cursor]")
  let xOffset = 6;
  let yOffset = 50;
  let cursorIsOnRight = false;
  let currentTarget = null;
  let lastText = '';
  
  // Position cursor relative to actual cursor position on page load
  gsap.set(cursorItem, {xPercent: xOffset, yPercent: yOffset});

  // Use GSAP quick.to for a more performative tween on the cursor
  let xTo = gsap.quickTo(cursorItem, "x", { ease: "power3"});
  let yTo = gsap.quickTo(cursorItem, "y", { ease: "power3"});

  // On mousemove, call the quickTo functions to the actual cursor position
  window.addEventListener("mousemove", e => {
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let scrollY = window.scrollY;
    let cursorX = e.clientX;
    let cursorY = e.clientY + scrollY; // Adjust cursorY to account for scroll

    // Default offsets
    let xPercent = xOffset;
    let yPercent = yOffset;

    // Adjust X offset if in the rightmost 19% of the window
    if (cursorX > windowWidth * 0.66) {
      cursorIsOnRight = true;
      xPercent = -100;
    } else{
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

      if (newText !== lastText) { // Only update if the text is different
        cursorParagraph.innerHTML = newText;
        lastText = newText;
      }
    }

    gsap.to(cursorItem, { xPercent: xPercent, yPercent: yPercent, duration: 0.9, ease: "power3" });
    xTo(cursorX);
    yTo(cursorY - scrollY); // Subtract scroll for viewport positioning
  });

  
  // Add a mouse enter listener for each link that has a data-cursor attribute
  targets.forEach(target => {
    target.addEventListener("mouseenter", () => {
      currentTarget = target; // Set the current target
      
      // If element has data-easteregg attribute, load different text
      let newText = target.hasAttribute("data-easteregg")
        ? target.getAttribute("data-easteregg")
        : target.getAttribute("data-cursor");

			// Update only if the text changes
      if (newText !== lastText) {
        cursorParagraph.innerHTML = newText;
        lastText = newText;
      }
    });
  });
  
 })
 