import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';

interface PreviewCubeProps {
  motionAllowed: boolean;
}

export function PreviewCube({ motionAllowed }: PreviewCubeProps) {
  const cube = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!motionAllowed || !cube.current) return;
    cube.current.rotation.x += delta * 0.16;
    cube.current.rotation.y += delta * 0.23;
  });

  return (
    <mesh ref={cube}>
      <boxGeometry args={[1.7, 1.7, 1.7]} />
      <meshStandardMaterial color="#a95d37" metalness={0.72} roughness={0.27} />
    </mesh>
  );
}
