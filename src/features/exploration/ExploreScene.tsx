import { Bounds, Environment, KeyboardControls, OrbitControls } from '@react-three/drei';
import type { EnvironmentProps } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import { ExplorerCharacter } from './character/ExplorerCharacter';
import { exploreKeyboardMap } from './input/exploreKeyboardMap';
import lighting from '../../config/scene-lighting.json';
import { SpiderhawkModel } from '../hero-scene/models/SpiderhawkModel';
import { GroundAndBounds, ShipCollision } from './collision/ShipCollision';
import type { ExploreSettings } from './config/explore-defaults';

export function ExploreScene({ settings, controlsEnabled, cameraMode }: { settings: ExploreSettings; controlsEnabled: boolean; cameraMode: 'follow' | 'orbit' }) {
  const light = lighting.exploration;
  const { ship, scene } = settings;
  // Keep the ship inside the follow camera's vertical field of view at its current scale.
  // const spawnPosition: [number, number, number] = [0, 0.82, ship.targetSize * 0.437 + 48];
  const spawnPosition: [number, number, number] = [0, 100.82, 0.437];
  
  return (
    <KeyboardControls map={exploreKeyboardMap}>
      <color attach="background" args={[light.background]} />
      <fog attach="fog" args={[light.fog.color, light.fog.near, scene.fogFar]} />
      <Environment preset={light.environmentPreset as EnvironmentProps['preset']} background={false} environmentIntensity={light.environmentIntensity} />
      <ambientLight intensity={scene.ambientIntensity} color={light.ambient.color} />
      <directionalLight position={light.directional.position as [number, number, number]} intensity={light.directional.intensity} color={light.directional.color} />
      <pointLight position={light.point.position as [number, number, number]} intensity={light.point.intensity} distance={light.point.distance} color={light.point.color} />

      <Physics gravity={[0, -9.81, 0]}>
        <GroundAndBounds size={scene.groundSize} />
        <ShipCollision targetSize={ship.targetSize} visible={ship.showCollisionProxies} />

        <Bounds fit={false} clip={false}>
          <SpiderhawkModel targetSize={ship.targetSize} alignToGround fitToBounds={false} shieldVisibility={ship.shieldStates} />
        </Bounds>

        <Suspense fallback={null}>
          <ExplorerCharacter settings={settings.character} spawnPosition={spawnPosition} controlsEnabled={controlsEnabled} cameraMode={cameraMode} />
        </Suspense>
      </Physics>
      <OrbitControls
        makeDefault
        enabled={cameraMode === 'orbit'}
        target={[0, ship.targetSize * 0.203, 0]}
        minDistance={8}
        maxDistance={settings.scene.groundSize * 0.9}
        minPolarAngle={0.08}
        maxPolarAngle={Math.PI * 0.48}
        enablePan
        enableDamping
        dampingFactor={0.08}
      />
    </KeyboardControls>
  );
}
