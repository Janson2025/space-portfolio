import { useFrame, useThree } from '@react-three/fiber';
import { RefObject, useEffect, useRef } from 'react';
import { RapierRigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';

interface FollowCameraProps {
  bodyRef: RefObject<RapierRigidBody | null>;
  yawRef: RefObject<number>;
  enabled: boolean;
  resetKey: string;
}

export function FollowCamera({ bodyRef, yawRef, enabled, resetKey }: FollowCameraProps) {
  const camera = useThree((state) => state.camera);
  const offset = useRef(new Vector3());
  const target = useRef(new Vector3());
  const desired = useRef(new Vector3());
  const upAxis = useRef(new Vector3(0, 1, 0));
  const initialized = useRef(false);

  useEffect(() => {
    initialized.current = false;
  }, [resetKey]);

  useFrame((_, delta) => {
    const body = bodyRef.current;
    if (!body) return;

    const position = body.translation();
    const yaw = yawRef.current;
    offset.current.set(0, 0.5, -2.2).applyAxisAngle(upAxis.current, yaw);
    desired.current.set(position.x, position.y, position.z).add(offset.current);
    target.current.set(position.x, position.y + 0.85, position.z);
    const firstFrame = !initialized.current;
    if (firstFrame) {
      camera.position.copy(desired.current);
      initialized.current = true;
    } else if (enabled) {
      camera.position.lerp(desired.current, 1 - Math.exp(-delta * 5));
    }
    if (enabled || firstFrame) camera.lookAt(target.current);
  });

  return null;
}
