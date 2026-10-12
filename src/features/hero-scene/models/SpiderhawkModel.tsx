import { useLayoutEffect, useMemo, useRef } from 'react';
import { useBounds, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import spiderhawkUrl from '../../../../assets/models/spiderhawk2.0.glb?url';
import shipMaterialConfig from '../config/ship-materials.json';

interface SpiderhawkModelProps {
  targetSize?: number;
  alignToGround?: boolean;
  fitToBounds?: boolean;
  shieldVisibility?: Record<string, boolean>;
}

function stableMaterialKey(material: THREE.Material) {
  const json = material.toJSON() as unknown as Record<string, unknown>;
  const withoutIdentity = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(withoutIdentity);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !['uuid', 'name', 'metadata'].includes(key))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, withoutIdentity(item)]));
  };
  return JSON.stringify(withoutIdentity(json));
}

function prepareShipScene(source: THREE.Group, animateShields: boolean) {
  const scene = source.clone(true);
  const materialGroups = shipMaterialConfig.groups;
  const aliases = new Map<string, (typeof materialGroups)[number]>();
  for (const group of materialGroups) {
    for (const name of group.names) aliases.set(name, group);
  }

  const shared = new Map<string, THREE.Material>();
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const isShield = object.name.toLowerCase().includes('shield');
    const prepare = (material: THREE.Material) => {
      const configured = material.clone();
      const settings = aliases.get(material.name);
      if (settings) {
        const color = new THREE.Color(settings.color);
        const standard = configured as THREE.Material & { color?: THREE.Color; metalness?: number; roughness?: number; opacity: number; transparent: boolean };
        standard.color?.copy(color);
        if (standard.metalness !== undefined) standard.metalness = settings.metalness;
        if (standard.roughness !== undefined) standard.roughness = settings.roughness;
        standard.opacity = settings.opacity;
        standard.transparent = settings.opacity < 1 || standard.transparent;
      }
      if (isShield && animateShields) {
        configured.userData.shieldBaseOpacity = configured.opacity;
        configured.transparent = true;
        configured.depthWrite = false;
        configured.opacity = 0;
        configured.needsUpdate = true;
      }
      if (isShield) return configured;
      const key = stableMaterialKey(configured);
      const existing = shared.get(key);
      if (existing) {
        configured.dispose();
        return existing;
      }
      shared.set(key, configured);
      return configured;
    };
    if (Array.isArray(object.material)) object.material = object.material.map(prepare);
    else object.material = prepare(object.material);
  });
  return scene;
}

/** Loads and frames the ship without changing the source GLB or its hierarchy. */
export function SpiderhawkModel({ targetSize = 4.2, alignToGround = false, fitToBounds = true, shieldVisibility }: SpiderhawkModelProps) {
  const { scene } = useGLTF(spiderhawkUrl);
  const bounds = useBounds();
  const modelRoot = useRef<THREE.Group>(null);
  const displayScene = useMemo(() => {
    const prepared = prepareShipScene(
      scene,
      shieldVisibility !== undefined
    );

    // Correct the model's forward-facing direction.

    return prepared;
  }, [scene, shieldVisibility !== undefined]);

  const transform = useMemo(() => {
    displayScene.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(displayScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z);
    const scale = largestDimension > 0 ? targetSize / largestDimension : 1;

    return {
      scale,
      position: new THREE.Vector3(-center.x * scale, (alignToGround ? -box.min.y : -center.y) * scale, -center.z * scale),
    };
  }, [alignToGround, displayScene, targetSize]);

  useLayoutEffect(() => {
    if (fitToBounds && modelRoot.current) bounds.refresh(modelRoot.current).clip().fit();
  }, [bounds, fitToBounds, transform]);

  useFrame((_, delta) => {
    if (!shieldVisibility) return;
    displayScene.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || !object.name.toLowerCase().includes('shield')) return;
      const enabled = shieldVisibility[object.name] ?? false;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        const baseOpacity = Number(material.userData.shieldBaseOpacity ?? material.opacity);
        material.opacity = THREE.MathUtils.damp(material.opacity, enabled ? baseOpacity : 0, 7, delta);
      }
    });
  });

  return (
    <group ref={modelRoot} position={transform.position} scale={transform.scale}>
      <primitive object={displayScene} dispose={null} />
    </group>
  );
}
