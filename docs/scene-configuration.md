# Scene configuration

The portfolio keeps artist-facing settings in JSON so scene tuning does not require opening a component or adding a visible settings panel.

## Lighting

Edit [`src/config/scene-lighting.json`](../src/config/scene-lighting.json) to adjust the two lighting profiles:

- `shipPreview` controls the small hero canvas.
- `exploration` controls the full-page ship walk scene, its fog, and its background.

Each profile has a Drei environment preset and intensity, an ambient light, a directional key light, and a point light. Positions use Three.js world units. The exploration light is bright enough to read the ship against the dark ground while preserving the warm sunset environment.

## Spiderhawk materials

Edit [`src/features/hero-scene/config/ship-materials.json`](../src/features/hero-scene/config/ship-materials.json). Each `groups` entry lists Blender material names with identical source PBR settings, plus editable `color`, `metalness`, `roughness`, and `opacity` values. Adjusting a group's values updates every name in its `names` list. Runtime loading clones the source material instances and merges identical configured materials; it leaves the GLB hierarchy and geometry intact.

Material settings that differ in GLB extensions such as glass transmission, clearcoat, or specular response are kept in separate groups and preserved from the asset. Newly named materials added in future Blender exports continue to use their GLB values until they are added to this config. After an asset update, review the material names and regroup any new duplicates.

The shuttle and Spiderhawk are each normalized to the same selected longest dimension (96 units by default), so their rendered world scale stays comparable. The Spiderhawk bounds measured from `spiderhawk2.0.glb` are about 51 × 20.5 × 43.8 source units. Kate spawns beyond the forward side, while the ground defaults to 240 units across. The developer panel can adjust ship length from 48 to 160 units; its ground-size control keeps a minimum margin around the selected ship size.

The current collision blockout is data-driven in [`ship-colliders.json`](../src/features/exploration/config/ship-colliders.json). Proxy centers and half-extents are ratios of the selected ship size, so resizing the ship also resizes the hull blocker. Turn on **Show collision proxies** in the Ship panel tab to inspect the red wireframe. The model and shields are visual-only; neither produces Rapier collision shapes.

The current single exterior proxy is an interim perimeter obstacle. It lets Kate walk around the ship but does not yet provide a walkable hull surface, boarding route, deck floors, or room walls. For the full ship, add a dedicated low-poly `COLLISION` collection in Blender with stable IDs and zones for exterior hull surfaces, room floors, walls, ramps, and door openings. Name proxy objects with a stable prefix such as `COL__EXTERIOR__HULL__MAIN` or `COL__DECK01__FLOOR__BRIDGE`; include a zone/profile in exported extras. Keep physics proxies separate from visual and shield meshes. At load time, extract only these low-detail meshes and create Rapier colliders from them. A coarse hull surface can support exterior walking while room floor and wall proxies provide interior navigation without colliding with every detailed render mesh. The JSON blockout is useful until those Blender proxies are ready.

The collision setup should stay layered: (1) exterior walkable surfaces and hull blockers, (2) deck/room floors and walls, (3) door and interaction sensors. Do not use one convex hull over the entire ship as the long-term solution; it would seal the interior. Keep room colliders grouped by stable zone IDs so authored doorways can connect areas without rebuilding unrelated colliders. Dynamic doors can use separate kinematic bodies later. Shield meshes remain visual-only and should never be part of the character collision layer.

The developer panel opens from the top-right **DEV CONTROLS** button. Its Character tab adjusts walk/run/turn/jump values; its Ship tab adjusts the shared shuttle/Spiderhawk model scale, Spiderhawk collision proxy view, and shield opacity; its Scene tab adjusts ground size, ambient light, and fog distance. The **VIEW: FOLLOW / ORBIT** button switches between the character follow camera and mouse-driven orbit controls around the ship. These values are session-only. Add new live-tuned properties to `ExploreSettings` and keep their defaults alongside the other exploration defaults.

The GLBs contain the Spiderhawk shield meshes `bird shield`, `shuttle1 shield`, `shuttle2 shield`, and `shuttle3 shield`, plus the shuttle’s `Shuttle shield` mesh. The Ship panel provides 0–100% opacity sliders for all shields and for each individual shield. Shield material opacity fades while preserving the GLB’s transmission settings. Shields are visual-only and are never used for collision. The shuttle collider is the `shuttle collisions` mesh; the source mesh is removed from the render scene and its copied geometry is supplied only to Rapier.

## Kate VRM materials

Edit [`src/features/exploration/config/character-materials.json`](../src/features/exploration/config/character-materials.json). The `materials` entries are keyed by the VRM material names and expose a base tint, MToon shade and outline colors, shading shift, toon level, outline width, and opacity where the source model provides them. Hex colors are convenient for tinting texture-backed materials; setting them to white preserves their original texture color.

## Movement tuning

The movement defaults live in `src/features/exploration/config/explore-defaults.ts` and can be adjusted at runtime in the developer panel. Gravity and terminal fall speed remain constants in `ExplorerCharacter.tsx`. A and D rotate in place; W walks along the facing direction. S turns the character toward the camera and walks forward in that direction. Shift increases speed while walking; Space jumps, with a stronger running movement rate retained during a running jump. Kate currently has idle and walk clips only, so the jump pose uses the idle clip and a running jump uses the faster walk cycle until dedicated jump animations are added.

The controls, camera, actor motion, and scene composition are kept in separate feature modules. Keep future ship interactions and animated component logic in new focused modules rather than adding visitor controls or debugging panels to the scene.
