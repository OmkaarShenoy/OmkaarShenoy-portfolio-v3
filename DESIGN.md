npx skills add https://github.com/Leonxlnx/taste-skill

npx skills add pbakaus/impeccable

# The Summer Pinboard: A High-Fidelity Design Blueprint

This document serves as the exhaustive technical and aesthetic specification for the "Summer Pinboard" portfolio. It defines the "Effortless Whimsy" framework—a system for transforming professional data into a tactile, interactive digital scrapbook.

---

## 1. Core Philosophy: "Effortless Whimsy"
The design rejects the "corporate grid" in favor of a **non-linear workspace**. It mimics a physical desk where items are scattered, overlapping, and interactive.
- **Tone:** Nonchalant, lowercase-primary, technically dense but visually light.
- **Mental Model:** A summer afternoon moodboard.

---

## 2. The Visual System (Atomic Details)

### A. Color Palette (Sun-Bleached OKLCH)
We use the `oklch` color space for superior perceptual uniformity and "sun-bleached" vibrancy.
- **Canvas (Paper):** `oklch(98% 0.01 45)` — A warm, non-glaring bone white.
- **Ink:** `oklch(25% 0.05 250)` — A deep charcoal blue (never #000).
- **Petal (Accent):** `oklch(85% 0.08 340)` — Soft rose pink for emphasis and script text.
- **Sage:** `oklch(92% 0.06 150)` — Minty green for lists and organic accents.
- **Sun:** `oklch(94% 0.08 85)` — Butter yellow for bulb glows and highlights.

### B. Typography Hierarchy
1. **Headlines:** *Cabinet Grotesk* (Bold, Tracking -5%). Used for the "hi, i'm [name]" hero.
2. **Personal Touch:** *Homemade Apple* (Cursive). Used for names and handwritten notes.
3. **Utility:** *Satoshi*. Used for body text and technical descriptions.
4. **Meta:** *Geist Mono*. Used for tool indicators and tech stacks.

### C. Textures
- **Paper Grain:** A fixed-position SVG turbulence filter (`baseFrequency="0.65"`) at `0.03` opacity. It sits on the top z-index layer (`z-400`) but uses `pointer-events: none`.

---

## 3. Interaction Mechanics (The Physics)

### A. GSAP Draggable Logic
Every "Scrap" item must be draggable with the following parameters:
- `edgeResistance: 0.65` (Feeling "heavy" near the edges).
- **Drag Start:** Scale up to `1.1`, increase rotation by `5deg`, and add a deep `shadow-2xl`.
- **Drag End:** Snap back to original rotation with `elastic.out(1, 0.3)` and return to a subtle `shadow-md`.

### B. Perspective Integrity
The viewport must have a `perspective: 2000px` applied to the **workspace container**, not the `body`. This ensures that `position: fixed` UI elements (Pills/Nav) don't inherit 3D distortions and remain pinned to the glass.

---

## 4. Component Deep-Dive

### A. The Lampshade (Dark Mode Toggle)
- **Visual:** A floating PNG of a classic lampshade (`z-100`).
- **Interaction:** Clicking toggles the `.dark` class on the root.
- **Dark Mode CSS:**
  - `paper`: `oklch(18% 0.02 250)` (Deep midnight blue).
  - `ink`: `oklch(99% 0.01 45)` (Bone white).
- **Bulb Glow:** A `radial-gradient` beam with a `clip-path: polygon` creates a 30-degree light cone that only appears in dark mode.

### B. The Crayon (Scribble Mode)
- **Visual:** A `PencilLine` icon in the floating nav.
- **Implementation:** An overlay `<canvas>` element that covers the full height of the scrollable document (`200vh`).
- **Logic:**
  - When active, `pointer-events: auto` is enabled on the canvas.
  - Ink uses the `oklch` Ink color with a `lineWidth` of `3` and `lineCap: round`.
  - The "Tidy Up" button must call `ctx.clearRect()` to wipe the canvas.

### C. The Brand Logo (Experience Cards)
- **Visual:** `w-28 h-28` rounded-3xl white card.
- **Interaction:** A "Detail Card" is hidden behind it. On hover, the Detail Card slides out or fades in with a higher `zIndex`, revealing the role and tech stack.

### D. The Polaroid (Project Flip)
- **Visual:** 4:5 aspect ratio with a `font-script` caption.
- **Interaction:** A 3D Y-axis rotation (`rotateY: 180`). The "Back" contains project meta-data.

---

## 5. Architectural Implementation

### The SCRAP_DATA Pattern
Content is managed via a single array of objects. Each object contains:
- `id`, `type`, `top`, `left`, `rotation`.
- **Responsive Layout:** Coordinates are string percentages (e.g., `left: "15%"`) to allow the "messy desk" to scale across screen sizes.

### The "Tidy Up" Algorithm
A global reset function that uses `gsap.to` to transition all `.scrap-item` elements back to `x: 0, y: 0` and their initial data-driven rotation. It serves as a safety "escape hatch" for the user.

---

## 6. QA & Aesthetic Validation
- **No Floating Clutter:** Hero text should be clear of items on initial load.
- **Elasticity:** If it doesn't bounce, it's not whimsical.
- **Lowercase:** Stick to all-lowercase for headers to maintain the "nonchalant" tone.
