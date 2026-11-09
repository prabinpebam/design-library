---
name: image-prompting
description: Use whenever a picture is needed in the Design library or a template (a hero, card picture, spot illustration, empty-state art, avatar, sponsor or product shot), or when generating, regenerating, trimming, optimizing, storing or captioning one. Generates with the global GPT Image 2.5 skill (gpt-image-2-5), prompts by OpenAI's documented structure, keeps a set consistent with one style reference image, uses true alpha and trims transparent margins with tools/trim-alpha.mjs, generates at the resolution intended for display, ships optimized WebP through the template's assets.json, and writes alt text that matches the picture.
---

# Image prompting: pictures that belong in the layout

Owner rule Q84 (2026-11-09 08:22): every picture on this project is generated with the **global GPT Image 2.5 skill**, and plenty of pictures are authorized. A picture earns its place through the [visual representation](../../../docs/visual-representation.md) reasoning chain (Q77) first: show something only a picture can show, and never decorate.

This skill owns the prompt, the reference image, the size, the alpha, the file and the alt text. Whether a picture belongs at all is `visual-representation.md`; how much ink it may add is `visual-noise`; the alt wording follows `ui-copy`.

## The pipeline, in order

1. **Spec the slot** from the [image audit](../../../docs/images.md): location, purpose, display size in CSS px, aspect ratio, transparent or opaque, style set, alt intent. No spec, no picture.
2. **Pick the generation size** (below): at least the display size times 2; one generation size per slot class in a set.
3. **Write the prompt** in the structure below, with the set's style block pasted verbatim.
4. **Make or reuse the set's one reference image.** The first picture of a set is generated from text and chosen as the reference; every other picture in the set is an `edit` with that reference as Image 1.
5. **Draft at `low`, finalize at `high`.** Look at every result with the `view` tool before using it.
6. **Check it:** subject, style match, no text or logos, alpha real (`--report`), nothing clipped at the edges.
7. **Prepare it:** `node ./tools/trim-alpha.mjs RAW.png -o packages/templates/<t>/assets/<id>.webp --width <css> --density 2` (trims transparent margins, resizes, encodes WebP).
8. **Record provenance:** `assets-src/<set>/<id>.json` with the prompt, model, size, quality, reference, date and alt. The raw PNG stays in `.design-library/image-raw/` (ignored, never published).
9. **Wire it in** through the template's `assets.json` (`src` + `alt`) and the content JSON that names the asset id (Q64). Never a path or alt in a component.
10. **Write the alt last**, from the finished picture, then run `npm run check:content` and the build.

## Calling the generator

The global skill's one CLI (`gpt-image-2.5-sunburst` on Azure OpenAI; the key lives in Windows Credential Manager and is never printed or written anywhere):

```powershell
$IMG = "$env:USERPROFILE\.copilot\skills\gpt-image-2-5\scripts\imagegen.py"
python $IMG check                                   # key and deployment work (one tiny low image)
python $IMG generate -p PROMPT -o RAW.png --size 1536x1024 --quality high --background opaque
python $IMG generate -p PROMPT -o RAW.png --size 1024x1024 --quality high --background transparent --output-format png
python $IMG edit -i reference.webp -p PROMPT -o RAW.png --size 1536x1024 --quality high   # Image 1 = the set's reference
python $IMG alpha RAW.png                           # transparent / partial / opaque fractions
```

Measured on this deployment (global skill, 1024²): `low` ≈ 17–30 s and ≈ $0.006, `high` ≈ 70–80 s and ≈ $0.05; a reference image adds ≈ 1,000 input tokens. Batch a set in one packet; draft every slot at `low`, then run the keepers at `high`. Don't edit the global skill or its script; when it fails, report the exact sanitized error.

## Prompt structure

OpenAI's fundamentals ([Image prompting](https://developers.openai.com/api/docs/guides/image-prompting), [gpt-image-1.5 guide](https://developers.openai.com/cookbook/examples/multimodal/image-gen-1.5-prompting_guide)): name the intended use, then scene → subject → details → constraints in short labelled sections; describe visible things (medium, materials, light, colour, framing), not moods; state exclusions; change one thing per iteration and restate what must stay.

```text
Use: <where it appears and what it does>, e.g. "card picture for a blog post about tide pools, shown at 360×240".
Subject: <the one thing the picture must show, concretely>.
Details: <materials, objects, actions; what makes it specific to this content>.
Composition: <framing, viewpoint, where the subject sits>, e.g. "subject centred, fills about 70% of the width, eye level".
Style: <the set's style block, verbatim, the same words in every prompt of the set>.
Constraints: no text, no letters or numbers, no logos or trademarks, no watermark, no frame or border<, the transparent-background lines below>.
```

- **Intended use first.** "Spot illustration for an empty search result" sets the polish and framing better than adjectives. Say the display size and aspect ratio in words too.
- **Concrete over mood.** "Three moored fishing boats, low tide, wet sand reflecting a pale sky" beats "a calm coastal vibe". Words like "8K" do nothing; medium and texture words do.
- **No text in pictures.** Text belongs in the UI where it's translatable, accessible and themeable (`ui-copy`). Always add "no text, no letters, no numbers". When text is truly required, quote it exactly and check the spelling.
- **No third-party IP.** No brands, logos, products, characters, a named living artist's style, or real people. Use the fictional names from the content JSON only.
- **One change per iteration.** Pass the previous output to `edit`, say "change only X; keep the subject, framing, palette and style", and repeat the preserve list each time ([Image prompting: Iterate deliberately](https://developers.openai.com/api/docs/guides/image-prompting)).
- **Quality, one setting at a time.** Raise `quality` only when detail fails; compare one setting at a time.

## Style sets and the reference image

A **style set** is every picture that appears together: one template, or one library area. Each set has:

- **A style block**, written once in the audit and pasted verbatim into every prompt of the set. It names the medium, the palette (colours drawn from the template's tokens), line weight, texture, lighting direction and the subject's scale. OpenAI's transparent-assets cookbook keeps a product collection consistent the same way: every product prompt ends with the same brand-and-style suffix ([Transparent image assets](https://developers.openai.com/cookbook/examples/multimodal/transparent-image-assets-for-campaigns-and-presentations)).
- **One reference image**, `assets-src/<set>/reference.webp`: the first finished picture of the set, chosen by looking. Every later picture in the set is an `edit` with it as Image 1 and a prompt that gives it one role: *"Image 1 is a style reference only: copy its medium, palette, line weight, texture and lighting. Do not copy its subject or composition. Draw: …"* ([Image prompting: Assign roles to references, Transfer a visual style](https://developers.openai.com/api/docs/guides/image-prompting)). One reference per set, not several: two references pull the style two ways.
- **One scale rule** ("the subject fills about 70% of the width", "the horizon sits at two thirds"), so detail reads the same size across pictures.

Consistency still drifts ([Image generation: Limitations](https://developers.openai.com/api/docs/guides/image-generation)): compare each new picture beside the reference before keeping it, and regenerate rather than accept one that looks like another set.

## True alpha, then trim

- Ask the API **and** the prompt: `--background transparent --output-format png`, plus "isolated <subject> on a fully transparent background; no backdrop, no ground, no cast shadow, no checkerboard, no frame". OpenAI warns that **the prompt wins over the parameter**: describe a background or scene and you get one ([Transparent image assets: Set up](https://developers.openai.com/cookbook/examples/multimodal/transparent-image-assets-for-campaigns-and-presentations)). A drawn checkerboard isn't transparency ([Image prompting: transparent cutout](https://developers.openai.com/api/docs/guides/image-prompting)).
- **Check the alpha**, don't trust it: `node ./tools/trim-alpha.mjs RAW.png --report` (or the global `alpha`) must say `"real": true`; look at edges, hair, glass and thin lines.
- **Trim every transparent picture.** The model pads the subject with empty space, which turns into unwanted padding in the layout and breaks alignment with the text beside it. `trim-alpha.mjs` crops to the bounding box of pixels with alpha > 8 (`--threshold`), then resizes. Space around the picture comes from the layout's gap tokens (`spacing`), never from transparent pixels; `--pad` exists only for a soft edge (a glow) that must not touch the box.
- Opaque pictures (scenes, photographs) are never trimmed; frame them by composition, and `--fit cover` when the slot's ratio differs.

## Resolution: generate for the display size

Pictures in one view share a **visual resolution**: the same number of image pixels per CSS pixel, and the same apparent size of strokes and textures. A picture generated large and shrunk a lot looks finer than one generated small and shown big.

1. Take the slot's display size in CSS px from the audit (the largest it gets, at the widest layout).
2. Target file = display × **2** (`--density 2`, sharp on high-density screens without shipping far more pixels than shown; [web.dev: Serve responsive images](https://web.dev/articles/serve-responsive-images)).
3. Generation size = the smallest allowed size **at or above** the target with the same aspect ratio: both edges multiples of 16, ratio ≤ 3:1, edges ≤ 3840, 655,360–8,294,400 pixels in total ([Image generation: Size and quality](https://developers.openai.com/api/docs/guides/image-generation)). So 512×512 isn't allowed: generate 1024×1024 and downscale. Never upscale (`trim-alpha.mjs` warns).
4. **Every picture of one slot class in a set uses the same generation size and the same scale rule**, so trimming and downscaling apply the same ratio and line weights match. A picture used in two classes is generated for the larger one, subject in the centre third.

| Slot (CSS px) | Ratio | Generate | File (2×) |
|---|---|---|---|
| Hero 1200×600 | 2:1 | 2400×1200 | 2400×1200 |
| Card 360×240 | 3:2 | 1536×1024 | 720×480 |
| Wide card 640×360 | 16:9 | 1536×864 | 1280×720 |
| Spot illustration ≤ 240 wide, transparent | ~1:1 | 1024×1024 | ≤ 480 wide after trim |
| Avatar 96×96 | 1:1 | 1024×1024 | 192×192 |

## Formats and weight

- **WebP** for everything shipped (alpha supported, far smaller than PNG): `--format webp --quality 82` (alpha quality 90). AVIF (`--format avif`) only when a slot needs it; PNG only for lossless needs. SVG stays for icons (the Icon fundamental) and simple vector diagrams, never for generated pictures.
- **Proposed** budgets (not measured baselines, see `performance`): SC1 content picture (1200×800) ≤ 200 KB, spot illustration ≤ 40 KB, wide hero ≤ 350 KB. Measured on Harbour: painterly 1200×800 pictures are 150–185 KB as WebP 82 and about half as AVIF; flat illustration is far lighter.
- The slot reserves its aspect ratio so nothing shifts as it loads, and pictures below the fold load lazily (`perceived-performance`).

## Alt text that matches the picture

The visual-representation audit (G1) found placeholder landscapes with informative alt on unrelated cards. So:

- **Write the alt after looking at the final picture**, never from the prompt: the model may have drawn something else. Say what it shows that matters in this place, in one sentence, without "image of" ([W3C WAI: An alt decision tree](https://www.w3.org/WAI/tutorials/images/decision-tree/)).
- **Informative** pictures (a speaker's portrait, a venue, a product) get alt naming what's shown. **Decorative** pictures (mood art beside a heading that says it all) get `"alt": ""`, and the audit marks the slot decorative.
- A picture reused in two places has the right alt for each, or is decorative in both.
- The alt sits in `assets.json` next to `src`, so the picture and its words change together.

## Licensing and provenance

- OpenAI's terms assign the output to the user, but output may not be unique and similar output may reach others ([OpenAI Terms of Use: Ownership of content, Similarity of content](https://openai.com/policies/row-terms-of-use/)); this deployment runs on Azure OpenAI under the Microsoft product terms.
- Purely AI-generated material may not be protected by copyright without human authorship ([U.S. Copyright Office, Copyright and Artificial Intelligence, Part 2](https://www.copyright.gov/ai/)): the pictures ship under the repository's MIT licence as project assets, with no claim of exclusivity.
- Never prompt for third-party IP, real people or logos; never send private or customer content as a reference.
- Every shipped picture has its provenance file in `assets-src/` (prompt, model, size, quality, reference, date, alt), so it can be regenerated and audited.
- `sharp` (Apache-2.0; its prebuilt libvips binaries are LGPL-3.0) is a root dev dependency used only by `tools/trim-alpha.mjs`; no package ships it.

## Checklist before a picture ships

- [ ] The slot is in the audit, and the visual-representation chain says a picture helps here.
- [ ] Generated with the global GPT Image 2.5 skill, at the set's generation size, from the set's style block and reference.
- [ ] Viewed beside the reference: same medium, palette, line weight and scale.
- [ ] No text, logos, watermark, frame or third-party IP.
- [ ] Transparent: alpha real, margins trimmed. Opaque: framed by composition.
- [ ] File = display × 2, WebP, within the proposed budget.
- [ ] Alt written from the finished picture (or `""` when decorative), in `assets.json`.
- [ ] Provenance JSON in `assets-src/<set>/`.
- [ ] `npm run check:content` and the build pass.

## Sources

- OpenAI, [Image prompting](https://developers.openai.com/api/docs/guides/image-prompting) (GPT Image 2.5 guide: fundamentals, references, transparent cutout, character consistency, checking the result).
- OpenAI, [Image generation](https://developers.openai.com/api/docs/guides/image-generation) (sizes, quality, transparency, formats, limitations, costs).
- OpenAI Cookbook, [Generate transparent image assets for campaigns and presentations](https://developers.openai.com/cookbook/examples/multimodal/transparent-image-assets-for-campaigns-and-presentations) (shared style suffix, the prompt beats the background parameter, edge quality).
- OpenAI Cookbook, [gpt-image-1.5 prompting guide](https://developers.openai.com/cookbook/examples/multimodal/image-gen-1.5-prompting_guide) (archived; structure, constraints, style transfer).
- OpenAI, [Terms of Use](https://openai.com/policies/row-terms-of-use/); U.S. Copyright Office, [Copyright and Artificial Intelligence](https://www.copyright.gov/ai/).
- W3C WAI, [An alt decision tree](https://www.w3.org/WAI/tutorials/images/decision-tree/); web.dev, [Serve responsive images](https://web.dev/articles/serve-responsive-images).
- The global `gpt-image-2-5` skill (`%USERPROFILE%\.copilot\skills\gpt-image-2-5\SKILL.md`): CLI, measured timings and costs, alpha snapping.
