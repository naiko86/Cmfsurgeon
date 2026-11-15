# Design package: cmfsurgeon.com, cinematic edition (Tier 1)

Lives outside `site/`, never deployed. Every line of copy below ships verbatim.

## 1. Brand premise

**Calm precision.** One idea from the operating room: the moment the surgical light is focused, everything goes quiet and exact. The film moves from the light to the prepared field; the page moves from the name to the work to the conversation. Every section serves one action for a colleague met at a congress: save the contact and write.

## 2. Palette (from the existing site world; finalise from the approved footage)

```css
:root{
  --canvas:#050b1a;        /* deep surgical navy, never pure black */
  --panel:#0c1631;         /* cards, raised surfaces */
  --accent:#2f6bff;        /* CTA and rare emphasis */
  --accent-hover:#5a8bff;
  --accent-muted:rgba(143,178,255,.18); /* hairlines, glows, particles */
  --text-secondary:#a6b3cc;
  --text-primary:#f3f6fc;
}
```

Footage world: cool blue-white surgical light, navy shadow, steel-blue sterile drape, brushed steel.

## 3. Type trio (self-hosted, no third-party requests)

- Display: **Schibsted Grotesk** 600/700, tight tracking. Editorial, exact, not Inter.
- Body: **Inter** 400/500 (already self-hosted; body only).
- Mono: **IBM Plex Mono** 500 for small labels, the OR-monitor voice.

## 4. Band map (hero 400vh; ranges are starting points, flick-tested later)

| Band | Range | Footage moment | Copy (verbatim) | Entrance |
|---|---|---|---|---|
| 1 | 0.00 to 0.30 | Close under the surgical light, lens cells glowing | Label: "Oral & Maxillofacial Surgeon · Austria" / H1: "Onur Dogru" / sub: "MD, DMD" | Settled on load (approach-from-depth, load ramp) |
| 2 | 0.34 to 0.62 | Camera tilts down through the beam, a beat of glare | "Planned to the millimetre." / "Performed with a calm hand." | Blur-to-sharp (echoes the light coming into focus) |
| 3 | 0.68 to 1.00 | Arrival: cool light pool resting on the blue sterile drape, instruments laid out on the right | H2: "Let's talk cases." / sub: "Deputy Senior Consultant, University Hospital St. Pölten. Orthognathic, reconstructive, trauma and facial plastic surgery." / CTAs: "Save contact" · "Connect on LinkedIn" | Word-by-word rise into staged settle |

Text lives in the left 45 percent of the frame; the action lane (light, beam, instruments) sits centre-right.

## 5. Static hero copy (phones, reduced motion; over the ending frame)

Label "Oral & Maxillofacial Surgeon · Austria", H1 "Onur Dogru", sub "MD, DMD", line "Planned to the millimetre. Performed with a calm hand.", CTAs "Save contact" · "Connect on LinkedIn".

## 6. Below the hero (one CTA anchor: #contact, Save contact)

1. **Intro with portrait** (ironed photo): "Deputy Senior Consultant at the Department of Oral and Maxillofacial Surgery, University Hospital St. Pölten. I also teach at Karl Landsteiner University of Health Sciences in Krems." Stats: "MD + DMD" dual qualification; "EN · DE · TR" working languages.
2. **Clinical focus** (existing five tiles, copy unchanged).
3. **About / facts** (existing list, EAFPS + ÖGMKG; German zahnop.at note unchanged).
4. **Contact** with second portrait and the business card. **Interactive moment: "Hold to focus."** Press and hold the card: the light ring tightens onto it and the QR code sharpens from blur. Release early eases back. Reduced motion: card shown sharp.
5. Footer: unchanged (legal notice, privacy, Deutsch: zahnop.at). No fictional-brand note (real person); hero film is AI-generated imagery of an operating light, no people.

Form: none. The CTA is the vCard download plus email and LinkedIn (honest: no backend).

## 7. Vector layer

Keep the existing self-drawing OR line art (instruments, surgeon) as the fixed environment layer behind the lower sections; the hero film replaces the OR-light drawing at the top. Whisper-level dust motes in the light (CSS, paused off-screen). All honour reduced motion.

## 8. Engineering list

Blob fetch with poster first and loading ring (streamed if over 8 MB), dt-normalised lerp, gated seeks with error escape, delta-gated DOM writes, band pacing plus flick test, four-layer legibility system with worst-frame audit at 3.5:1, five static-hero gates identical in CSS and JS with live change listeners, complete without video, overflow-x clip, reduced motion both directions, quality floor.

## 9. Copy gate

All lines above ship verbatim. Built page must pass the Phase 9 grep gate (zero em dashes, zero stock words) and the AI-tell sweep. Austrian medical advertising rules apply: no superlatives, no outcome promises.
