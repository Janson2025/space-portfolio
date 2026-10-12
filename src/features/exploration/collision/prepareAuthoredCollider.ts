import * as THREE from 'three';

const SHIP_GROUND_CLEARANCE = 1;

export interface PreparedAuthoredCollider {
  /** Collider geometry in the same normalized local space as the rendered model. */
  geometry: THREE.BufferGeometry;
  /** Model transform that must be applied to both the visual and collider. */
  position: THREE.Vector3;
  scale: number;
}

/**
 * Copies a named GLB mesh into normalized model space and removes it from the
 * visual hierarchy. Rapier receives only this copy; the source mesh stays hidden.
 */
export function prepareAuthoredCollider(
  model: THREE.Object3D,
  nodeName: string,
  targetSize: number,
): PreparedAuthoredCollider | null {
  model.updateMatrixWorld(true);
  const node = model.getObjectByName(nodeName);
  if (!(node instanceof THREE.Mesh) || !node.geometry.getAttribute('position')) return null;
  // Hide the source node immediately; Rapier gets the copied geometry only.
  node.visible = false;

  const modelBounds = new THREE.Box3().setFromObject(model);
  if (modelBounds.isEmpty()) return null;
  const modelSize = modelBounds.getSize(new THREE.Vector3());
  const longestDimension = Math.max(modelSize.x, modelSize.y, modelSize.z);
  if (!(longestDimension > 0) || !(targetSize > 0)) return null;

  const scale = targetSize / longestDimension;
  const center = modelBounds.getCenter(new THREE.Vector3());
  const modelPosition = new THREE.Vector3(
    -center.x * scale,
    SHIP_GROUND_CLEARANCE - modelBounds.min.y * scale,
    -center.z * scale,
  );

  node.updateWorldMatrix(true, false);
  const modelInverse = model.matrixWorld.clone().invert();
  const nodeToModel = node.matrixWorld.clone().premultiply(modelInverse);
  const geometry = node.geometry.clone();
  geometry.applyMatrix4(nodeToModel);

  const position = geometry.getAttribute('position');
  const normalizedPositions = new Float32Array(position.count * 3);
  for (let index = 0; index < position.count; index += 1) {
    normalizedPositions[index * 3] = (position.getX(index) - center.x) * scale;
    normalizedPositions[index * 3 + 1] = (position.getY(index) - modelBounds.min.y) * scale + SHIP_GROUND_CLEARANCE;
    normalizedPositions[index * 3 + 2] = (position.getZ(index) - center.z) * scale;
  }

  const sourceIndices = geometry.index;
  const indices: number[] = sourceIndices
    ? Array.from(sourceIndices.array as ArrayLike<number>)
    : Array.from({ length: position.count }, (_, index) => index);
  if (indices.length < 3 || indices.length % 3 !== 0 || indices.some((index) => index < 0 || index >= position.count)) {
    geometry.dispose();
    return null;
  }

  const colliderGeometry = new THREE.BufferGeometry();
  colliderGeometry.setAttribute('position', new THREE.BufferAttribute(normalizedPositions, 3));
  colliderGeometry.setIndex(indices);
  colliderGeometry.computeBoundingSphere();
  geometry.dispose();
  node.parent?.remove(node);

  return { geometry: colliderGeometry, position: modelPosition, scale };
}
