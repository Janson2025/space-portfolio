import { CuboidCollider, RigidBody } from '@react-three/rapier';
import colliderConfig from '../config/ship-colliders.json';

interface ShipCollisionProps {
  targetSize: number;
  visible: boolean;
}

export function ShipCollision({ targetSize, visible }: ShipCollisionProps) {
  const profile = colliderConfig.profiles.find((item) => item.id === 'exterior');
  if (!profile) return null;
  return (
    <RigidBody type="fixed" colliders={false}>
      {profile.proxies.map((proxy) => {
        const center = proxy.centerRatio.map((value) => value * targetSize) as [number, number, number];
        const halfExtents = proxy.halfExtentsRatio.map((value) => value * targetSize) as [number, number, number];
        return (
          <group key={proxy.id} position={center}>
            {/* <CuboidCollider args={halfExtents} />
            we want to use treemesh not cube collider for the scene and ship
            {visible && (
              <mesh>
                <boxGeometry args={halfExtents.map((value) => value * 2) as [number, number, number]} />
                <meshBasicMaterial color="#ff5548" wireframe transparent opacity={0.65} depthWrite={false} />
              </mesh>
            )} */}
          </group>
        );
      })}
    </RigidBody>
  );
}

export function GroundAndBounds({ size }: { size: number }) {
  const half = size / 2;
  const edge = half - 0.25;
  const wallHeight = Math.max(4, size * 0.08);
  const gridDivisions = Math.max(16, Math.round(size / 6));
  return (
    <>
      <gridHelper args={[size, gridDivisions, '#607676', '#29383b']} position={[0, 0.015, 0]} />
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[half, 0.12, half]} position={[0, -0.12, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[size, size]} />
          <meshStandardMaterial color="#222c30" metalness={0.48} roughness={0.78} />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[half, wallHeight, 0.25]} position={[0, wallHeight, -edge]} />
        <CuboidCollider args={[half, wallHeight, 0.25]} position={[0, wallHeight, edge]} />
        <CuboidCollider args={[0.25, wallHeight, half]} position={[-edge, wallHeight, 0]} />
        <CuboidCollider args={[0.25, wallHeight, half]} position={[edge, wallHeight, 0]} />
      </RigidBody>
    </>
  );
}
