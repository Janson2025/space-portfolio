import { Suspense } from 'react';
import { Bounds, Environment, OrbitControls } from '@react-three/drei';
import { SpiderhawkModel } from '../models/SpiderhawkModel';
import { PreviewCube } from '../components/PreviewCube';
import { Starfield } from '../components/Starfield';
import lighting from '../../../config/scene-lighting.json';
import type { EnvironmentProps } from '@react-three/drei';

interface ShipPreviewSceneProps {
  motionAllowed: boolean;
}

export function ShipPreviewScene({ motionAllowed }: ShipPreviewSceneProps) {
  const light = lighting.shipPreview;
  return (
    <>
      <Environment preset={light.environmentPreset as EnvironmentProps['preset']} background={false} environmentIntensity={light.environmentIntensity} />
      <ambientLight intensity={light.ambient.intensity} color={light.ambient.color} />
      <directionalLight position={light.directional.position as [number, number, number]} intensity={light.directional.intensity} color={light.directional.color} />
      <pointLight position={light.point.position as [number, number, number]} intensity={light.point.intensity} distance={light.point.distance} color={light.point.color} />
      <Starfield motionAllowed={motionAllowed} />
      <Bounds fit clip margin={1.15}>
        <Suspense fallback={<PreviewCube motionAllowed={motionAllowed} />}>
          <SpiderhawkModel />
        </Suspense>
      </Bounds>
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={2.5}
        maxDistance={14}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI - 0.25}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}
