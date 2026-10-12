import { useFrame, useThree } from '@react-three/fiber';
import { RefObject, useRef } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';

interface FollowCameraProps {
  bodyRef: RefObject<RapierRigidBody | null>;
  yawRef: RefObject<number>;
  enabled: boolean;
}

export function FollowCamera({ bodyRef, yawRef, enabled }: FollowCameraProps) {
  const camera = useThree((state) => state.camera);
  const offset = useRef(new Vector3());
  const target = useRef(new Vector3());
  const desired = useRef(new Vector3());
  const upAxis = useRef(new Vector3(0, 1, 0));

  useFrame((_, delta) => {
    if (!enabled) return;
    const body = bodyRef.current;
    if (!body) return;

    const position = body.translation();
    const yaw = yawRef.current;
    offset.current.set(0, 3.1, -7.2).applyAxisAngle(upAxis.current, yaw);
    desired.current.set(position.x, position.y, position.z).add(offset.current);
    target.current.set(position.x, position.y + 0.65, position.z);
    camera.position.lerp(desired.current, 1 - Math.exp(-delta * 5));
    camera.lookAt(target.current);
  });

  return null;
}
