# Collision system plan

## What the reference projects do

- [spaceship-3rd-person-controller](https://github.com/Janson2025/spaceship-3rd-person-controller) uses Rapier for the scene/character but its `getSafeCameraPosition` helper is a Three.js raycast from the character toward the camera. That solves camera clipping; it is not the character's walkable world collision system.
- [r3f-3rd-person-controller-final](https://github.com/wass08/r3f-3rd-person-controller-final) puts the loaded map under a fixed Rapier rigid body with `colliders="trimesh"`. Its character uses a capsule collider on a moving rigid body. It is a useful compact demo, but it treats the whole render map as one collider and does not address ship interior/exterior zones or asset collision quality.

## Current project state

- `ExplorerCharacter` already uses a Rapier kinematic character controller with a capsule, autostep, snap-to-ground, and computed collider movement. Keep its input, movement, and camera behavior unchanged while improving scene colliders.
- The shuttle already extracts the authored `shuttle collisions` node, hides it from rendering, normalizes it to the model's shared target size, and attaches it as a fixed trimesh collider. This is the best low-risk validation scene.
- Spiderhawk still uses one oversized cuboid proxy. A separate `spiderhawk-collision2.0.glb` exists, but its main primitive alone contains 518,148 position vertices and 785,235 triangles; it is too dense for a first runtime collider and its single unnamed zone cannot yet distinguish interior from exterior surfaces.
- Ship shields are visual-only and must remain excluded from collision extraction.

## Staged implementation

1. **Harden the shuttle baseline (now):** move GLB collider extraction, transform normalization, invisibility, and geometry validation into a small reusable helper. Keep a clear diagnostic and gracefully omit the trimesh if the named source node is missing or malformed. Use the shuttle scene as the collision test bed.
2. **Prepare Spiderhawk assets:** author a dedicated Blender collision collection with low-poly meshes and stable names/zones, for example `COL__EXTERIOR__WALKABLE`, `COL__EXTERIOR__BLOCKER`, `COL__DECK01__FLOOR`, `COL__DECK01__WALLS`. Separate walkable exterior surfaces from room floors/walls, preserve actual door openings, exclude shield geometry, and decimate the existing 518k-vertex mesh substantially. Confirm model transforms/scale match the rendered GLB.
3. **Load by authored zones:** extract only named `COL__` nodes into independent fixed Rapier trimesh colliders. Apply the same model normalization transform as the visual; do not attach the render ship to Rapier. Expose a development-only wireframe/material view so authored surfaces can be inspected without making physics geometry visible to visitors.
4. **Validate in increments:** first verify shuttle floor/wall traversal and no shield collision, then add Spiderhawk exterior, then one interior deck, then boarding/door transitions. Check spawn points, edge/corner sliding, stairs, ceilings, and scene switches at multiple model scales. Keep the existing training plane/cube as a known-good regression scene.

## Asset authoring guidance

Collision geometry should be static, low-poly, and made of the surfaces the capsule must contact, rather than a solid watertight hull that seals every room. Use simple, non-overlapping surfaces where possible; avoid tiny triangles, duplicate coplanar faces, and decorative detail. Interior and exterior meshes should be separate named objects. A single closed shell is insufficient for a ship where the character must walk both inside and outside: use open walkable exterior sections and independent interior floor/wall zones, with planned openings where the player can pass between zones.

The existing shuttle node name can remain `shuttle collisions` for its first pass. For later multi-zone assets, use the `COL__<zone>__<purpose>__<name>` convention and keep source collision nodes out of the visible scene.
