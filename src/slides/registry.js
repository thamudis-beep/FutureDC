import TitleSlide from "./TitleSlide";
import StackRebuildSlide from "./StackRebuildSlide";
import OrbitalSlide from "./OrbitalSlide";
import OrbitalTableSlide from "./OrbitalTableSlide";
// import ClosingSlide from "./ClosingSlide"; // parked — revisit the takeaway later

// The deck, in order. Each slide component may declare:
//   .steps  — number of intra-slide fragment advances (default 0)
//   .title  — label shown in the overview / counter
// Add a slide by importing it and dropping it into this array.
// Two orbital options (A: cinematic scene, B: breakdown table) for the team.
export const slides = [TitleSlide, StackRebuildSlide, OrbitalSlide, OrbitalTableSlide];
