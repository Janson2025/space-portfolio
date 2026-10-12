# 3D Scene and Spiderhawk Asset Plan

For the next phase of adding a controllable character and ship interactions, see the [Ship Character Exploration Plan](character-exploration-plan.md).

## Current implementation

The banner's `.ship-stage` is the shared responsive frame for the nebula background and the R3F scene. The static ship image remains the fallback while the canvas loads or when WebGL is unavailable. The live scene now loads the Spiderhawk GLB, with a copper cube shown while the model downloads. The ship is centered and scaled from its measured bounds, and Drei's bounds helper fits the camera after it loads. Orbit controls allow rotation and zoom without panning. The cube stops rotating when the visitor requests reduced motion.

The R3F code is grouped by responsibility:

```text
src/features/hero-scene/
  HeroScene.tsx                 Canvas, WebGL fallback, motion preference
  scenes/ShipPreviewScene.tsx   Scene composition, lighting, controls, loading fallback
  models/SpiderhawkModel.tsx    GLB loading, root normalization, camera bounds refresh
  components/PreviewCube.tsx    Temporary loading preview
  components/Starfield.tsx      Lightweight background effect
```

Keep `HeroScene` as the single canvas boundary. Put future scene compositions in `scenes/`, reusable 3D objects in `components/`, asset loading and normalization in `models/`, and input/navigation behavior in `interaction/` or focused hooks. Keep page content, UI controls, and 3D asset details out of one large scene component. The React page should choose which scene to show; scene modules should own the Three.js objects and scene-level behavior.

## Spiderhawk GLB audit

The asset currently in the project is [spiderhawk2.0.glb](../assets/models/spiderhawk2.0.glb). The audit below reads its glTF metadata and geometry accessors; it does not replace a visual review in Blender or a browser.

- File size: about 68.3 MB.
- Scene hierarchy: 421 nodes and 405 meshes.
- Geometry: 853 triangle primitives, about 1.48 million vertices, and about 2.16 million triangles. The GLB has 3,336 accessors and buffer views.
- Materials: 62; no embedded texture images.
- Animation: no animation clips. There is one skin with four joints, but no `JOINTS_0`/`WEIGHTS_0` mesh attributes; verify whether it is unused before retaining it.
- Extensions: clearcoat, transmission, emissive strength, specular, and IOR material extensions.
- The node names indicate many already-separated ship parts, including rooms, floors, roofs, bridge, cockpit, airlock, escape pods, engines, dishes, antennas, and panels. Many mesh datablocks still have Blender-style generated names such as `Cube.*` or `Mesh.*`; the scene is mostly flat beneath the root.

The accompanying Blender 5.0.1 scene inventory adds useful source-authoring detail. It reports 80 nested collections under `SHIP`, including six deck collections, room shells, frames, engines, doors, utilities, accessories, shields, shuttles, and observation points. That is a meaningful organization already present in Blender. The GLB, however, exports nearly all of those objects as direct children of one root; Blender collection boundaries are not preserved as GLB node groups by this export. Preserve the collection structure in the `.blend` source and explicitly recreate the needed groups as parent empties or export separate modules when preparing runtime assets.

The inventory reports 436 collection object entries, while the GLB contains 430 nodes. It also contains repeated object names and shared mesh data names; some entries may be objects linked into multiple collections, so deduplicate by Blender object identity before drawing conclusions about actual object counts. The inventory reports three mesh objects with zero vertices, which may be placeholders or empty leftovers to review. It reports no custom properties, so there are not yet stable application IDs embedded in the source. Its vertex and face totals describe Blender mesh data, while the GLB's accessor/triangle totals describe the exported geometry after glTF conversion; use the GLB metrics for web performance budgeting.

The current separation is useful for authoring and future selection, but a single 68.3 MB scene with over two million exported triangles is too costly to treat as the final first-load experience. The flat runtime hierarchy, generic datablock names, duplicated materials, and the unexplained skin need review before interaction code depends on this export. The best path is to retain the good Blender collection organization and improve the export structure around it.

### Current GLB size breakdown

The current file is 68,347,740 bytes (about 68.35 MB / 65.2 MiB). Its JSON metadata chunk is 686,964 bytes; its binary chunk is 67,660,748 bytes. The file has no embedded images or textures, so nearly all of its size is geometry data:

| Geometry stream | Approximate bytes | What it stores |
| --- | ---: | --- |
| Positions | 17.81 MB | Vertex coordinates |
| Normals | 17.81 MB | Vertex surface directions |
| UV coordinates | 10.87 MB | Texture coordinates, present even though this GLB has no image textures |
| Triangle indices | 18.73 MB | References joining vertices into triangles |
| Vertex colors | 2.44 MB | Three color attribute sets (`COLOR_0`, `COLOR_1`, `COLOR_2`) |

The binary payload is therefore large because the export contains detailed geometry for hundreds of separately exported meshes, not because of images. It has 853 triangle primitives, which can also mean many separate draw submissions even though material and draw-call cost do not directly account for the downloaded byte size.

For a web exterior, first remove hidden interior/detail geometry from that export and reduce the triangle count. Then profile Meshopt or Draco compression on the remaining geometry. Inspect whether `TEXCOORD_0` and the extra vertex color sets are needed by the actual materials; remove unused streams only after confirming the rendered appearance. Consolidate compatible static meshes/materials where that will not compromise Blender updates or future interaction. Keep the detailed source export and create separately optimized, versioned runtime exports.

## Asset authoring and update strategy

1. Keep the Blender `.blend` file as the authoritative editable source. Treat GLB files as generated runtime exports. Do not make one-off fixes only in an exported GLB.
2. Before adding interaction, establish a coordinate contract: ship forward/up axes, scene origin, unit scale, and predictable pivots. Preserve that contract between exports so camera framing and character navigation do not drift.
3. Keep and refine the existing Blender Outliner collections instead of rebuilding them from scratch. Preserve the six deck groupings and room/system subcollections; normalize collection names and spellings, and make sure objects belong to the intended export module. Keep moving parts as separate objects with pivots at their hinges or rotation axes.
4. Give interaction targets stable IDs independent of display names, for example `door.airlock.primary` or `console.bridge.navigation`. Add these as Blender custom properties and export them as glTF extras where possible. If extras are not reliably retained, generate a small manifest from the Blender inventory mapping IDs to node names, asset version, file path, and interaction type. Avoid using array position, generated mesh names, or material names as application identifiers.
5. Consolidate duplicate materials and reduce material variety where visually acceptable. Check normals and remove unnecessary double-sided rendering. Keep genuinely interactive or animated parts separate; combine static surfaces by room or material where it reduces draw calls without preventing future editing.
6. Create explicit runtime groups from the existing collections, because collection nesting alone is lost in the current GLB. Export and profile a low-detail exterior for the hero. For the future walkthrough, split detailed interiors by deck or room and load them only when nearby or entered. Add lower-detail LODs for distant views. Keep a sensible full-quality export for authoring/reference, separate from web delivery variants.
7. Compress geometry and textures for delivery and record measured download size, decoded memory, triangle count, and draw calls for each web variant. The current file has no embedded textures, but future room furnishing may add them; use web-ready texture sizes and formats.
8. Use versioned exports and a stable manifest or asset-map import so updating the Blender source does not require changing React scene code. Keep the last known-good export for rollback. Before publishing a new version, compare required stable IDs and bounds against the previous export.

## Planned loading and interaction layers

The current model component is the first single-GLB preview. It imports the GLB as a Vite asset URL, uses Drei `useGLTF` to load it, and centers/scales the root from its measured bounds without changing the cached scene hierarchy or materials. The cube is a Suspense loading fallback, while the static banner image remains the canvas/WebGL fallback. Keep this separation as the scene grows. Add a visible model-load error state if diagnostics show the static fallback alone is not clear enough when a GLB fails.

For the later walkthrough, keep these concerns separate:

- **Scene composition:** camera, lighting, exterior and room modules.
- **Navigation:** character controller, collision volumes, walkable surfaces, and room transitions.
- **Interaction registry:** stable component IDs mapped to actions such as open, inspect, activate, or show details.
- **Presentation state:** selected object, active deck, opened doors, and UI panels.
- **Asset streaming:** load/unload rooms and LODs based on location and device capability.

Next, inspect the integrated preview's orientation, materials, visual framing, and load behavior in a browser, then create a smaller web-ready exterior export. Start interaction with a small number of raycastable named hotspots. Add walkable interiors only after the room shells, collision proxies, door pivots, and loading boundaries are stable. This lets the ship receive ongoing Blender updates without making navigation and interaction depend on fragile mesh ordering.

## Next asset review

Review the integrated preview in Blender and a browser. Confirm the current front/up orientation, world bounds, visual result of the material extensions, the four-joint skin, and whether the empty-looking root structure reflects the intended authoring organization. Then create a smaller web preview export and measure its load and render cost on desktop and mobile. The current production build emits the 68.3 MB source GLB as a separate asset; it is suitable for initial integration, not the final first-load experience.
