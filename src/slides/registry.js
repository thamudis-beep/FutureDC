import TitleSlide from "./TitleSlide";
import OrbitalSlide from "./OrbitalSlide";
import StackRebuildSlide from "./StackRebuildSlide";
// import ClosingSlide from "./ClosingSlide"; // parked — revisit the takeaway later

// The deck, in order. Each slide component may declare:
//   .steps  — number of intra-slide fragment advances (default 0)
//   .title  — label shown in the overview / counter
// Add a slide by importing it and dropping it into this array.
export const slides = [TitleSlide, OrbitalSlide, StackRebuildSlide];
