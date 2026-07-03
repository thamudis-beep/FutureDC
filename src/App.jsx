import React from "react";
import Deck from "./deck/Deck";
import { slides } from "./slides/registry";

// The presentation: a fixed-canvas slide deck that scales to any viewport.
// Add or reorder slides in ./slides/registry.js.
export default function App() {
  return <Deck slides={slides} />;
}
