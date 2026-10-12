import { RigidBody, TrimeshCollider } from '@react-three/rapier';
import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GroundAndBounds } from '../collision/ShipCollision';
import { prepareAuthoredCollider } from '../collision/prepareAuthoredCollider';
import shuttleUrl from '../../../../assets/models/shuttle2.0.glb?url';

const COLLISION_NODE_NAME = 'shuttle collisions';
const SHIELD_NODE_NAME = 'Shuttle shield';
export function ShuttleScene({ targetSize, groundSize, shieldOpacity }: { targetSize: number; groundSize: number; shieldOpacity: number }) {
  const { scene: source } = useGLTF(shuttleUrl);
  const prepared = useMemo(() => {
    const visual = source.clone(true);
    const shield = visual.getObjectByName(SHIELD_NODE_NAME);
    shield?.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const prepare = (material: THREE.Material) => {
        const cloned = material.clone();
        cloned.userData.shieldBaseOpacity = cloned.opacity;
        cloned.transparent = true;
        cloned.depthWrite = false;
        cloned.opacity = 0;
        cloned.needsUpdate = true;
        return cloned;
      };
      object.material = Array.isArray(object.material) ? object.material.map(prepare) : prepare(object.material);
    });

    const collider = prepareAuthoredCollider(visual, COLLISION_NODE_NAME, targetSize);
    if (collider) return { visual, ...collider };

    console.error(`Shuttle GLB needs a valid '${COLLISION_NODE_NAME}' mesh; showing the visual model without ship collision.`);
    visual.getObjectByName(COLLISION_NODE_NAME)?.parent?.remove(visual.getObjectByName(COLLISION_NODE_NAME)!);
    visual.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(visual);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = targetSize / Math.max(size.x, size.y, size.z);
    return {
      visual,
      // position: new THREE.Vector3(-center.x * scale, -bounds.min.y * scale, -center.z * scale),
      position: new THREE.Vector3(-center.x * scale,2, -center.z * scale),
      scale,
      geometry: null,
    };
  }, [source, targetSize]);

  useEffect(() => () => prepared.geometry?.dispose(), [prepared.geometry]);

  useFrame((_, delta) => {
    const shield = prepared.visual.getObjectByName(SHIELD_NODE_NAME);
    shield?.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        const amount = THREE.MathUtils.clamp(shieldOpacity, 0, 1);
        const baseOpacity = Number(material.userData.shieldBaseOpacity ?? 1);
        material.opacity = THREE.MathUtils.damp(material.opacity, baseOpacity * amount, 7, delta);
      }
    });
  });

  return (
    <>
      <GroundAndBounds size={groundSize} />
      <group position={prepared.position} scale={prepared.scale}>
        <primitive object={prepared.visual} dispose={null} />
      </group>
      {prepared.geometry && (
        <RigidBody type="fixed" colliders={false}>
          <TrimeshCollider args={[
            prepared.geometry.getAttribute('position').array,
            prepared.geometry.index!.array,
          ]} />
        </RigidBody>
      )}
    </>
  );
}
