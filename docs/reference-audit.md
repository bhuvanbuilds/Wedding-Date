# Reference audit (internal)

Short notes from the research pass that shaped the design. Learnings only — no layouts, code or imagery were copied.

## Inspected in the browser

**wedding.tonami-komuro.com** (Tonami & Ayano)
- Midnight base with grainy, out-of-focus light blooms; feels like film, not flat UI.
- Huge thin serif headings paired with tiny tracked uppercase labels in parentheses — “(TO OUR BELOVED GUESTS)”.
- Hairline vector ornaments (four-point stars, looping lines) that draw across sections.
- Vertical side rails with Japanese labels; restrained fixed top nav with small uppercase links.
- Giant date set as outline → fill; separate ceremony / reception times; venue with map + transit notes.
- Takeaways used here: parenthetical labels, vertical rails (desktop), outline→fill giant date, grain, practical venue block.

**shy-curtain-reveal.lovable.app**
- Tap-to-open curtain intro, then a glittering gold scratch strip over the date.
- Generic timeline cards with emoji; very long list of events.
- Takeaways: a single tactile gesture is memorable; keep the reveal on a tactile surface. Avoid emoji, generic cards and event sprawl.

**GSAP 3.15 (installed)** — SplitText (with `mask`, `aria`), ScrollTrigger, ScrollToPlugin and `@gsap/react` `useGSAP` are all free; `gsap.matchMedia` for reduced motion and automatic revert.

**React Bits** — license is MIT + Commons Clause (OK for a website). Its text-split and click-spark ideas were re-implemented locally; its WebGL backgrounds (ogl) were not used to keep mobile cost low.

## Not browsed (worked from existing knowledge)

21st.dev, Dribbble, Awwwards, Codrops, Aceternity, Magic UI, Motion Primitives, R3F/Three.js, Lenis. Decisions taken from them:
- **No Three.js / R3F** — a Canvas 2D particle heart gives the same feeling at a fraction of the cost and has no WebGL failure mode.
- **No Lenis / smooth-scroll hijacking** — native scrolling on phones; GSAP ScrollTo only for user-initiated jumps.
- **No component library** — every effect is a small local component in the site's own design language.

## Direction chosen

Japanese editorial restraint (asymmetry, hairlines, vertical rails, a hanko-style monogram seal, generous negative space) × Valentine romance (ruby particles, rose petals, wax seal, parchment) × cinematic sequencing (one GSAP motion language, chapter colour shifts from midnight → crimson → parchment → evening burgundy → night sky).
