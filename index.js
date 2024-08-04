import "./styles.css";
import Glide from "@glidejs/glide";
// Required Core Stylesheet
import "@glidejs/glide/src/assets/sass/glide.core";

// Optional Theme Stylesheet
import "@glidejs/glide/src/assets/sass/glide.theme";

var glide = new Glide(".glide", {
  type: "carousel",
  focusAt: "center",
  perView: 3
});
glide.mount();
