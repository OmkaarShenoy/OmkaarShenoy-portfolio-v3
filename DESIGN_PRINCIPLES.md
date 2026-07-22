# Design Principles

## philosophy

every interface exists at the intersection of technical precision and tactile warmth. the goal is not to impress with flash, but to leave a quiet, lasting impression — to make the human intent behind the work felt, not just seen.

every element earns its place. nothing is decorative for the sake of it.

---

## 1. intentional simplicity

> less noise. more signal.

strip away the unnecessary until only the essential remains. let content reveal itself in response to intent, not on a timer. the default state should feel complete — anything hidden behind a toggle or gesture is a reward for curiosity, not a necessity.

this isn't minimalism for its own sake. it's a trust exchange: the visitor is invited to explore deeper, not forced to consume everything at once.

**guidelines:**
- no splash graphics, no auto-playing media, no loading experiences that serve the brand instead of the user
- the primary content of each view should be visible without interaction
- every additional element must justify its existence against the question: *does this clarify or distract?*

---

## 2. material tactility

> digital interfaces that feel physical.

surfaces should have texture. backgrounds should have warmth. shadows should be directional and layered, mimicking real-world light sources. when a user interacts with an element, it should respond with the physics they instinctively understand — weight, friction, elasticity.

this is an interface you can almost touch.

**guidelines:**
- light mode should use warm, paper-like tones; dark mode should use near-black for depth
- shadows are subtle, layered, and directional — mimicking real light sources (top-left)
- surface textures (grain, noise, gradients) are present but barely perceptible — felt more than seen
- interactive elements have subtle highlights suggesting a slight physical sheen

---

## 3. typographic hierarchy

> letterpress in the browser.

typography carries the emotional weight of the interface. choose voices with personality — editorial serifs for authority, grotesques for clarity, scripts for warmth. treat each font choice as a casting decision.

lowercase text removes formality and invites a more personal, conversational tone — like a handwritten note rather than a corporate memo.

**guidelines:**
- **primary display**: headline scale, tight tracking (`-0.02em`), layered letterpress shadows for depth
- **body**: comfortable reading scale, subtle gradient, lighter emboss effect
- body text never exceeds ~48ch line length for comfortable reading
- accent faces (script, italic serif) are reserved for timestamps, captions, and personal moments
- monospace is reserved for code or structural elements — the only "machine" presence in the design

---

## 4. purposeful motion

> motion with meaning, not decoration.

every animation should serve a narrative purpose — building anticipation, conveying physicality, signaling state change. elements should feel alive, not automated. interactive objects should have weight: they resist, stretch, and snap back with physical realism.

when motion is reduced, the experience must remain intact. nothing breaks. nothing disappears.

**guidelines:**
- use `power3.out` and `power4.out` for entrances (confident, natural deceleration)
- use `elastic.out(1, 0.5)` for interactive elements (bounce conveys physicality)
- use `[0.16, 1, 0.3, 1]` for UI transitions — a custom ease that starts fast and settles gracefully
- duration targets: UI transitions 0.4–0.7s, entrances 0.6–0.8s, micro-interactions 0.15–0.3s
- all animations must respect `prefers-reduced-motion: reduce`
- stagger delays should feel organic, not mechanical (use small random offsets)

---

## 5. contextual adaptability

> one interface, two souls.

light and dark mode aren't afterthoughts — they're two complete material expressions. light mode is warm paper, afternoon reading. dark mode is deep charcoal, late-night focus.

every color, every shadow, every texture is reconsidered across both modes. elements invert their light sources. accent glows appear only where they make sense.

**guidelines:**
- light mode: warm, reflective tones with directional top-left shadows
- dark mode: deep, absorbent tones with inverted light sources
- theme transitions use `0.4s ease` — fast enough to feel responsive, slow enough to register
- CSS custom properties centralise theme switching (`--surface`, `--text`, `--accent`, etc.)
- mobile and desktop are distinct layout expressions, not scaled versions of the same thing

---

## 6. the user is in control

> exploration over instruction.

the interface should never dictate a flow. there are no "scroll down to learn more" prompts or "click here to begin" instructions. users discover interactivity through behavior — cursor changes, subtle transforms, physical feedback.

interactive elements signal affordance through their response, not through labels. drag because it responds like something that can be dragged. click because it moves like something that can be clicked.

**guidelines:**
- no tooltips, instructional overlays, or onboarding on first visit
- interactive elements signal affordance through behavior (cursor changes, subtle transforms, physics)
- every state transition is reversible (toggles expand and collapse, modals open and close)
- hide easter eggs and surprises for curious users — reward exploration

---

## 7. privacy as a principle

> transparency is part of the design.

analytics should be done with explicit intent. every interaction tracked should be a named event with clear purpose. if you collect data, show the user what and why — no dark patterns, no hidden tracking.

contact forms should ask for the minimum. no cookies for marketing. no auto-subscribing. no tracking parameters in shared links.

**guidelines:**
- all analytics events are named semantically with clear context
- no third-party tracking scripts (no Google Analytics, no Meta pixels, no advertising networks)
- forms collect only what's necessary for the immediate interaction
- if an admin or data dashboard exists, make it visible — transparency builds trust

---

## 8. lasting impressions

> the difference is in the details.

a great interface isn't remembered for its layout — it's remembered for how it made someone feel. the way a toggle has elastic resistance. the way an image subtly shifts on hover. the way a menu item has a gentle bounce. the way a button depresses like a physical key.

these are the details that separate a template from a point of view.

**guidelines:**
- micro-interactions should feel physically inspired (elasticity, inertia, resistance, gravity)
- state changes should never be instant — even a 150ms transition signals that something happened
- hover states should offer a reward (scale, color shift, opacity change, reveal)
- empty states, loading states, and errors should be handled with the same care as happy paths
- every animation, color, and texture should feel cohesive — as if they all belong to the same material world
