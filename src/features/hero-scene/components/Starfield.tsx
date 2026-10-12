import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StarfieldProps {
  motionAllowed: boolean;
}

export function Starfield({ motionAllowed }: StarfieldProps) {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const positions = new Float32Array(100 * 3);
    for (let index = 0; index < 100; index += 1) {
      const seed = index + 1;
      positions[index * 3] = Math.sin(seed * 127.1) * 5.5;
      positions[index * 3 + 1] = Math.sin(seed * 311.7) * 3;
      positions[index * 3 + 2] = -1.5 - (Math.sin(seed * 74.7) * 0.5 + 0.5) * 3;
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return starGeometry;
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ pointer, clock }) => {
    if (!motionAllowed || !points.current) return;
    points.current.rotation.set(pointer.y * 0.015, -pointer.x * 0.025 + Math.sin(clock.elapsedTime * 0.08) * 0.01, 0);
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial color="#d9a174" size={0.018} transparent opacity={0.56} sizeAttenuation />
    </points>
  );
}
