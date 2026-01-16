import { imageLinks } from "./imageLinks.js";

const imageContainer = document.querySelector(".image-list");

imageLinks.forEach(link => {
  const img = document.createElement("img");
  img.src = link;
  img.alt = "Image";
  imageContainer.appendChild(img);
});
