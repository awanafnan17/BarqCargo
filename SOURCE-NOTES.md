# BarqCargo source notes

Home, About, Services, Contact, Our network and a custom 404 page. Serve `dist/` with any static HTTPS host. Run `python3 build.py` after editing the Python templates or `content.json`. CSS and JavaScript in `dist/` are authored source files and versioned with the generated pages.

## Final client revision

- Home keeps the ocean film and interactive mustard kite. Its canvas spans the full desktop hero, and the complete animated rig is centered and fitted to the nearest camera plane on every frame. Pointer rotation is bounded. On mobile, the text, reserved animation area, six partner logos and controls occupy separate rows without overlapping.
- About, Services, Contact and Our network share one ocean hero layout with six animated carrier logos in the right-hand visual area. These heroes contain no ship or kite model. Their text and logos stack on mobile. Our network is available at `/network/`; it is omitted from the mobile hamburger menu as requested and remains linked in the footer.
- The Home narrative has a stationary blue gradient. Only the large-ship SVG and the 1 / 3 / 5 fleet move right to left. The hull artwork remains opaque, while its surrounding canvas is transparent. Outgoing and incoming copy are masked at the component edges without translating a full-screen backing panel.
- “Local knowledge. Global connections.” and the three complete company cards follow on one horizontal track. Each card's image, title, location and action move together. Scroll position drives each arrival and reversal. Previous/next controls land on complete cards; offscreen actions are inert. About and Our network use the same readable sequence on a light background.
- The oversized front/rear image passage on About is replaced by a responsive blue/white explanation of the shipment process: understand, coordinate and deliver. Its steps slide into place and update the progress indicator. Grid columns allow shrinking, the old aspect-ratio constraint is removed, and animation overflow is contained inside its own stage.
- FAQs use a blue gradient introduction and a white answer column. The question index reflects the selected open question and returns to a dash when all answers are closed. Native details and animated drawers remain keyboard accessible.
- The complete-vessel orbit in the page body, opening cargo container, service deck, two-column Services catalogue, eight detail dialogs, history timeline, labelled sample testimonials, shared loader, moving carrier strip and footer banner remain.

## Runtime

`motion-math.js` defines reversible poses, component edges, company-card stops and kite fitting. `app.js` owns navigation, loaders, dialogs, forms and the shared motion clock. `sequences.js` controls the horizontal narratives, service pairs, process steps, timeline and FAQs. `hero-experience.js` controls ocean playback and hero parallax. `archived-vessels.js` loads the isolated Three.js renderer, geometry and Barq materials. `cargo-3d.js` retains the original opening container.

Videos and 3D scenes pause outside the viewport, in hidden tabs and when motion is paused. Reduced-motion and no-script layouts retain all content in sequential grids. Posters and transparent images provide fallback artwork if video or WebGL is unavailable. Autoplay can be retried with the video control. Draco decoding uses a local worker.

The enquiry form prepares an email for the visitor to review and send; it does not submit to a backend. Service URLs open native dialogs and support Back/Forward. The four testimonials remain visibly labelled sample copy pending approved client statements.

## Assets and provenance

Business content, service/company photographs and carrier logos come from `https://barqcargo.netlify.app/`. Those images retain their original URLs, with readable carrier names if a logo fails to load. The cleaned Barq logo is local with a single navy background.

The user-supplied `my-archiving-session(4).wacz` provides the ocean film, transparent vessel/kite images, horizontal ship SVGs, Draco-compressed models, environment maps and container coordinates. Runtime materials and SVG fills use Barq's palette. Source-site forms, analytics, cookie scripts, investor logos, CMS integrations and application entrypoints are excluded.

The vessel has coated paint, soft directional shadows and a constant-distance camera orbit. Stray mast pieces are hidden. `tools/prepare-vessel.py` removes the source wordmark geometry and unused buffers from a supplied GLB, producing `dist/assets/vessels/cargo-vessel-barq.glb`. Opaque BarqCargo panels on both sides cover the former lettering area and the hull's letter cut-outs. `barqcargo-hull.svg` contains the exact wordmark.

`dist/vendor/three-archive.js` contains Three.js r156, GLTFLoader, DRACOLoader, BufferGeometryUtils and a small module helper. MIT and Draco Apache-2.0 notices are included. Archived visual assets are supplied reference material, not newly authored illustrations.

## Checks

- `node tests/motion.test.js`: 1,001 forward/reverse poses, two ship passes, copy masks, sequential company-card stops, service navigation and damping.
- `node tests/hero-motion.test.js`: camera orbits, pointer and keyboard turns, idle motion and hero parallax.
- `node tests/film-playback.test.js`: autoplay, offscreen/tab pause, reduced motion, manual pause/resume and recovery from blocked autoplay.
- `node tests/archived-assets.test.js`: actual GLB decoding, scene initialization, all 156 container instances, wordmark removal, ray-tested BarqCargo coverage on both sides, shadows, full-kite bounds during pointer sweeps across four canvas sizes, and paused scheduling.

All six pages are checked statically for local routes, fragments, labels, dialogs, assets, shared loaders, consistent inner heroes, mobile navigation, sequential company tracks, CSS delimiters and JavaScript syntax. Browser and device visual testing was not performed.
