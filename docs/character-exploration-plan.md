# Ship Character Exploration Plan

## Goal

Add an optional, small-scale character exploration mode to the portfolio's Spiderhawk scene. Visitors should be able to board the ship, move around a prepared area, and use a few clearly marked ship interactions. The default portfolio experience remains the ship showcase; exploration starts only after the visitor chooses it.

This is a staged plan. It does not assume that the entire ship is ready for a game-style walkthrough. The ship is still being authored, so scene organization, collisions, and interactions must survive updated Blender exports.

## Reference project findings

The [character configurator repository](https://github.com/Janson2025/r3f-ultimate-character-configurator) is a useful source of patterns:

- Its [architecture guide](https://github.com/Janson2025/r3f-ultimate-character-configurator/blob/main/readme/character-configurator.md) separates the stage, actors, assets, UI, and application coordination.
- Its [stage](https://github.com/Janson2025/r3f-ultimate-character-configurator/blob/main/src/components/stage/Stage.tsx) composes lighting, camera, helpers, physics, environment, and actor systems.
- Its [controlled actor](https://github.com/Janson2025/r3f-ultimate-character-configurator/blob/main/src/components/actors/ControlledActor.tsx) keeps the actor model, motion controller, and animation selection together behind one actor boundary.
- Its [third-person controller](https://github.com/Janson2025/r3f-ultimate-character-configurator/blob/main/src/controllers/thirdPerson/useThirdPersonAvatarController.ts) resolves input and advances movement in the R3F frame loop, while its [input context](https://github.com/Janson2025/r3f-ultimate-character-configurator/blob/main/src/input/AvatarInputContext.tsx) keeps keyboard and external controls behind one input shape.
- It has a [Rapier character-controller helper](https://github.com/Janson2025/r3f-ultimate-character-configurator/blob/main/src/controllers/collision/useKinematicCharacterController.ts) for collision-corrected movement and a separate [follow-camera controller](https://github.com/Janson2025/r3f-ultimate-character-configurator/blob/main/src/controllers/useThirdPersonFollowCamera.ts).
- Its live demo provides an example of third-person camera presets, keyboard/joystick movement, and animation previews: [live configurator](https://r3f-ultimate-character-configurator-ten.vercel.app/).

The portfolio can reuse these boundaries and selected movement/animation ideas. It does not need the configurator's character customization catalog, speech and lip-sync tools, combat, development UI, or its full set of animation options.

## Recommended experience

Keep two explicit experiences:

1. **Showcase:** the current ship preview and orbit controls.
2. **Explore:** a dedicated page with a larger, focused scene and a third-person camera following the character. A button on the showcase canvas navigates to this page. The route loads its own scene and captures keyboard movement input only while active; site navigation provides a clear way back to the portfolio.

The dedicated route is the better fit because the banner is too small and visually busy for comfortable navigation. A route is not inherently faster than an overlay if both render the same content; an overlay that unmounts the showcase and lazy-loads its own scene can reach similar runtime performance. The route gives us clean page boundaries and lets us lazy-load the Explore code, Kate, and physics only when Explore opens. The current showcase still loads the Spiderhawk GLB, so the route alone will not remove that 68.3 MB splash-page cost; a smaller hero export or image fallback will be needed to improve the initial page load. Navigating away should unmount the showcase canvas so it no longer renders during exploration.

The first implementation used an isolated ground-plane scene to tune Kate, movement, animation, camera, and collision without loading or debugging the 68.3 MB ship at the same time. The current pass adds the ship as a static landmark and uses an approximate hull footprint collider; accurate deck colliders and interactions remain later steps. Use one avatar and keep movement/input, collision, camera, and ship interaction modules separate as the scene grows.

### Confirmed starting choices

- Character: `assets/models/Kate.vrm` from the configurator project. The file is already present in this workspace and is about 15.2 MB.
- Camera: third-person follow.
- Entry: a dedicated Explore page reached from a button in the showcase canvas.
- First environment: a ground plane with the static Spiderhawk and an approximate hull collider.

## Proposed code boundaries

Keep the existing `HeroScene` as the canvas boundary, and add focused modules rather than growing `ShipPreviewScene` into a game-sized component:

```text
src/features/hero-scene/
  scenes/
    ShipPreviewScene.tsx
    ShipExploreScene.tsx
  character/
    ExplorerCharacter.tsx
    CharacterModel.tsx
    animationMap.ts
  input/
    ExplorerInputProvider.tsx
    keyboardMap.ts
    touchControls.tsx
  movement/
    useCharacterMovement.ts
    movementConfig.ts
  camera/
    useFollowCamera.ts
  collision/
    ShipColliders.tsx
  interaction/
    InteractionTarget.tsx
    interactionRegistry.ts
    useNearbyInteraction.ts
```

The portfolio UI owns the Showcase/Explore mode and overlays. Scene modules compose 3D objects. Character movement owns input-to-motion. The interaction registry maps stable IDs to actions and UI responses. Do not let DOM panels manipulate Three.js objects directly.

## Implementation status

- Added the lazy `/explore` route and a showcase button that opens it.
- Added the initial ground-plane test scene, static boundaries, a kinematic capsule controller, tank-style turning, forward and turn-back movement, sprint speed, jump impulses, and a third-person follow camera.
- Added Kate's VRM loader and retargeted idle/walk FBX clips from the configurator project. These assets are only requested by the Explore route. Until jump-specific clips are added, normal jumps use idle and running jumps use the faster walk cycle.
- Added the Spiderhawk to the ground-plane scene at an eight-times larger 96-unit scale, a scale-aware hull blockout, and a larger walk perimeter. The model is aligned to the ground and uses grouped, editable material overrides.
- Added a collapsible top-right developer panel with Character, Ship, and Scene tabs. It supports live movement tuning, ship scale and collider visualization, scene size/light/fog tuning, and individual plus master shield controls.
- Added fade transitions for the four named ship/shuttle shield meshes. Shield meshes remain visual-only and do not enter the Rapier collision configuration.
- Added a separate scale-aware JSON ship-collider profile and a visible proxy debug mode. It currently blocks the hull perimeter only; the Blender collision-collection convention and layered exterior/interior collision plan are documented in `docs/scene-configuration.md`.
- Added a live camera mode toggle between character follow and orbit controls centered on the ship.
- Moved hero and exploration light values to `src/config/scene-lighting.json`; material settings are documented in `docs/scene-configuration.md`.
- Removed the Explore prototype title block, kept the site header and footer, and sized the scene to fit between them without normal-page scrolling.
- The current canvas environment reports that WebGL is unavailable, so the page-level fallback is visible there. The production build succeeds; character pose, animation, and collision behavior still need visual validation in a WebGL-enabled browser.
- Next: visually validate ship scale, shield fades, and movement in a WebGL-enabled browser; then add dedicated Blender collision proxies for the exterior surface and one interior room.

## Implementation phases

### 0. Set up the Explore route

- Add a visible Explore button to the ship showcase and navigate to a dedicated route.
- Lazy-load the exploration route and its scene code. Do not mount the character, physics world, or ship exploration assets on the splash route.
- Define the back/navigation behavior, how keyboard focus is handled, and what control hint is shown.
- Keep ordinary site navigation and a usable page fallback available when WebGL is unavailable.

### 1. Build a simple character test scene

- Load `assets/models/Kate.vrm` by itself in a dedicated R3F canvas with the existing sunset lighting style adapted for the exploration scene.
- Add a ground plane, simple boundaries, a spawn point, and visible development axes/grid. Do not load the Spiderhawk yet.
- Confirm the VRM's scale, forward direction, foot position, material appearance, and idle pose. Confirm that the existing VRM loader correctly updates the model each frame.
- Add keyboard movement, walk/idle animation switching, collision against a capsule/ground, and the third-person follow camera.
- Tune movement speed, character scale, and camera distance in this simple environment before adding ship geometry.

### 2. Prepare a small ship area for runtime use

- Inspect the GLB's forward/up axes, unit scale, origin, and floor elevation in Blender and the current preview.
- Choose a compact area with a continuous floor and safe boundaries. The ship does not yet need to support a complete deck-to-deck route.
- Add simple collision proxy meshes in Blender for walkable floors, walls, large obstacles, and blocked openings. Keep render meshes separate from collision proxies; do not use the ship's detailed render meshes as the character collider.
- Give future doors, consoles, and other interaction targets stable IDs in Blender custom properties or an export manifest. Do not key gameplay by mesh order or generated names.
- Keep the `.blend` source authoritative. Export the render model and collision/interaction data as reproducible runtime assets so routine ship updates do not require rewriting React code.

### 3. Establish the animation contract

- Verify Kate's scale, forward direction, foot position, and skeleton. Keep the VRM under `assets/models/` and load it only on the Explore route.
- Check the configurator's animation files and retargeting approach for compatibility with Kate. Verify licensing/redistribution rights before copying animation files into the portfolio.
- Start with idle and walk. Confirm that the model's idle and walk animations share a compatible rig, or use the reference project's retargeting approach if the source clips use a different rig.
- Keep the model loader and animation mapping separate from movement logic. Movement state should select an animation; it should not manipulate bone transforms itself.

### 4. Add collision-aware walking

- Start with a capsule character collider and Rapier's kinematic character-controller approach for predictable, directly controlled movement. The reference repository's controller modules and input shape are useful guides; avoid copying its combat and configuration state.
- Begin with keyboard movement and a walking speed. Add running, jumping, slopes, steps, and touch controls only when the selected ship area needs them.
- Add walkable floor colliders, wall/obstacle proxies, and blocked deck edges. Keep collision geometry low-detail and stable across ship art revisions.
- Add a debug view for collision proxies and character position during development. Keep debug tooling out of the visitor-facing experience.
- Define an explicit spawn/reset location and a recovery action if the character falls outside the test area.

### 5. Add the follow camera and controls

- Use a third-person follow camera with a modest shoulder offset and damped movement. Keep the orbit camera used in Showcase separate from the follow camera used in Explore.
- Prevent the camera from crossing ship walls or obscuring the character where practical. Test narrow corridors and doorways before expanding the route.
- Show concise controls after entry: WASD or arrow keys to move, mouse/touch to adjust view if enabled, Escape to exit. Ensure controls do not activate while typing or using ordinary page navigation.
- Add a touch joystick only after keyboard movement works; the reference project's input context demonstrates how to send keyboard and on-screen input through the same interface.

### 6. Add one interaction end to end

- Add one stable-ID target, such as a console or airlock control, within the test area.
- Show a small prompt when the character is close enough and facing the target; activate it with a clear key such as `E` and a touch equivalent when mobile controls exist.
- Keep target detection (proximity/raycast), action handling, and the DOM information panel separate. Start with a non-destructive action, such as opening a ship information panel or toggling a light.
- Confirm that the interaction still resolves after the Blender asset is re-exported with stable IDs.

### 7. Expand the ship incrementally

- Add rooms only when their floors, collision proxies, doors, and load boundaries are stable.
- Split the ship into exterior and room/deck runtime modules, and load interior detail only when exploration needs it.
- Add reusable interaction types (inspect, activate, open) behind the ID registry. Add doors, elevators, character customization, or persistence only when a real visitor experience calls for them.
- Preserve a lightweight Showcase path. The current Spiderhawk source is about 68.3 MB and roughly 2.17 million triangles, so it needs a smaller web exterior and streamed interior modules before becoming a production walkthrough asset.

## First movement prototype

The initial prototype is complete when:

- the Explore route can be opened directly and from the portfolio;
- Kate loads in the ground-plane scene and can walk around the static Spiderhawk;
- the third-person camera follows her;
- keyboard input moves her, switches between idle and walk, and keeps her grounded;
- the portfolio remains usable when WebGL or the character asset is unavailable.

## First ship-interaction milestone

The first ship milestone is complete when a visitor can:

- use the Explore route to enter a prepared ship test area;
- see Kate in that area;
- walk with keyboard input, stay on the floor, and stop at walls;
- use a stable interaction target and see a clear result;
- use an exit/reset affordance if movement or camera state becomes confusing;
- continue to use the rest of the portfolio when WebGL or the exploration assets are unavailable.

## Decisions for ship integration

The character, camera, route, and initial ground-plane-with-ship environment are confirmed. The current collider only blocks the ship footprint; the next ship-scene decision is which deck area should become walkable first, followed by whether its first interaction should inspect a console, operate a light, or open a door.
